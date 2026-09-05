(function(){
 'use strict';
 const esc=s=>window.RevilyVisuals.escapeHtml(String(s)),math=s=>window.RevilyVisuals.mathMarkup(String(s));
 function decimal(value){const raw=String(value??'').trim();return window.RevilyValidators.parseDecimal(raw.replace(/^([+-]?)\./,'$10.'));}
 function sameDecimal(a,b){const x=decimal(a),y=decimal(b);return Boolean(x&&y&&x.n===y.n&&x.d===y.d);}
 const sameInteger=(a,b)=>/^\d+$/.test(String(a??''))&&BigInt(a)===BigInt(b);
 function evidence(q,response){
  if(q.response.type==='percentage_change_fields')return window.RevilyPercentageChangeStructure.evidence(q,response);
  if(q.response.type==='mixed_percentage_answer')return window.RevilyMixedPercentage.evidence(q,response);
  if(q.response.type==='percentage_form')return window.RevilyPercentageComparison.evidence(q,response);
  if(q.response.type==='measured_percentage_amount')return window.RevilyMeasuredPercentageAmount.evidence(q,response);
  if(q.response.type==='money_percentage_amount')return window.RevilyMoneyPercentageAmount.evidence(q,response);
  if(q.response.type==='method_choice_amount')return window.RevilyMethodChoiceAmount.evidence(q,response);
  if(q.response.type==='decimal_multiplier_amount')return window.RevilyDecimalMultiplierAmount.evidence(q,response);
  if(q.response.type==='one_percent_amount')return window.RevilyOnePercentAmount.evidence(q,response);
  if(q.response.type==='percentage_fraction_amount')return window.RevilyPercentageFractionAmount.evidence(q,response);
  if(q.response.type==='mixed_fdp_forms')return window.RevilyMixedFDP.evidence(q,response);
  if(q.response.type==='fdp_ordering')return window.RevilyFDPOrdering.evidence(q,response);
  if(q.response.type==='fdp_comparison')return window.RevilyFDPComparison.evidence(q,response);
  if(q.response.type==='percent_fraction')return window.RevilyPercentFraction.evidence(q,response);
  if(q.response.type==='decimal_percent'||q.response.decimal_percent_fraction||q.response.decimal_stage_fraction)return window.RevilyDecimalPercent.evidence(q,response);
  if(q.response.type==='equivalent_percent'||q.response.equivalent_percent_fraction)return window.RevilyEquivalentPercent.evidence(q,response);
  if(q.response.division_fraction)return window.RevilyDivisionDecimal.evidence(q,response);
  if(q.response.type==='equivalent_decimal'||q.response.equivalent_scale)return window.RevilyEquivalentDecimal.evidence(q,response);
  if(q.response.type==='power_ten_fields'||q.response.power_ten_fraction)return window.RevilyPowerTenDecimal.evidence(q,response);
  if(['decimal_fraction','decimal_places_pair'].includes(q.response.type))return window.RevilyDecimalFraction.evidence(q,response);
  if(q.response.type==='decimal_scale_pair'||q.response.scale_source)return window.RevilyDecimalScaling.evidence(q,response);
  if(q.response.type==='benchmark_forms')return window.RevilyBenchmark.evidence(q,response);
  if(q.response.type==='place_value_forms'){
   const fields=Object.fromEntries(q.response.fields.map(key=>[key,key==='decimal'?sameDecimal(response?.[key],q.answer.value[key]):sameInteger(response?.[key],q.answer.value[key])])),missing=Object.keys(fields).filter(key=>!fields[key]);
   return{correct:missing.length===0,fields,classification:!missing.length?'correct':missing.length===1?'check_'+missing[0]:'check_multiple',routeConfirmed:false,unseenMethodAssessed:false,earlierSkillStateChanged:false};
  }
  const paired=q.response.type==='place_value_pair',guided=q.response.pair_kind==='count_and_numerator';
  const fields=paired?{numerator:sameInteger(response?.n,q.answer.value.n),[guided?'count':'decimal']:guided?sameInteger(response?.count,q.answer.value.count):sameDecimal(response?.decimal,q.answer.value.decimal)}:{};
  const correct=paired?Object.values(fields).every(Boolean):q.response.type==='decimal'?sameDecimal(response,q.answer.value):window.RevilyValidators.validate({...q,evidence_profile:null},response);
  let classification=correct?'correct':'check_place_value';
  if(!correct&&paired){if(fields.numerator)classification=guided?'count_only':'decimal_only';else if(fields[guided?'count':'decimal'])classification='numerator_only';}
  if(!correct&&!paired&&q.response_feedback?.[String(response)])classification=String(response);
  return{correct,fields,classification,routeConfirmed:false,unseenMethodAssessed:false,earlierSkillStateChanged:false};
 }
 function markup(q,saved,locked){
  if(q.response.type==='percentage_change_fields')return window.RevilyPercentageChangeStructure.markup(q,saved,locked);
  if(q.response.type==='mixed_percentage_answer')return window.RevilyMixedPercentage.markup(q,saved,locked);
  if(q.response.type==='percentage_form')return window.RevilyPercentageComparison.markup(q,saved,locked);
  if(q.response.type==='measured_percentage_amount')return window.RevilyMeasuredPercentageAmount.markup(q,saved,locked);
  if(q.response.type==='money_percentage_amount')return window.RevilyMoneyPercentageAmount.markup(q,saved,locked);
  if(q.response.type==='method_choice_amount')return window.RevilyMethodChoiceAmount.markup(q,saved,locked);
  if(q.response.type==='decimal_multiplier_amount')return window.RevilyDecimalMultiplierAmount.markup(q,saved,locked);
  if(q.response.type==='one_percent_amount')return window.RevilyOnePercentAmount.markup(q,saved,locked);
  if(q.response.type==='percentage_fraction_amount')return window.RevilyPercentageFractionAmount.markup(q,saved,locked);
  if(q.response.type==='mixed_fdp_forms')return window.RevilyMixedFDP.markup(q,saved,locked);
  if(q.response.type==='fdp_ordering')return window.RevilyFDPOrdering.markup(q,saved,locked);
  if(q.response.type==='fdp_comparison')return window.RevilyFDPComparison.markup(q,saved,locked);
  if(q.response.type==='percent_fraction')return window.RevilyPercentFraction.markup(q,saved,locked);
  if(q.response.type==='decimal_percent')return window.RevilyDecimalPercent.markup(q,saved,locked);
  if(q.response.type==='equivalent_percent')return window.RevilyEquivalentPercent.markup(q,saved,locked);
  if(q.response.type==='equivalent_decimal')return window.RevilyEquivalentDecimal.markup(q,saved,locked);
  if(q.response.type==='power_ten_fields')return window.RevilyPowerTenDecimal.markup(q,saved,locked);
  if(['decimal_fraction','decimal_places_pair'].includes(q.response.type))return window.RevilyDecimalFraction.markup(q,saved,locked);
  if(q.response.type==='decimal_scale_pair')return window.RevilyDecimalScaling.markup(q,saved,locked);
  if(q.response.type==='benchmark_forms')return window.RevilyBenchmark.markup(q,saved,locked);
  if(q.response.type==='place_value_forms')return formsMarkup(q,saved,locked);
  const r=q.response,value=saved&&typeof saved==='object'?saved:{},disabled=locked?' disabled':'',guided=r.pair_kind==='count_and_numerator';
  const field=(key,label,mode)=>`<label><span>${esc(label)}</span><input data-pv-field="${key}" aria-label="${esc(label)}" inputmode="${mode}" autocomplete="off" value="${esc(value[key]??'')}"${disabled}/></label>`;
  const fraction=`<div class="pv-fraction-field"><span>Fraction</span><div class="fixed-fraction-builder"><input data-pv-field="n" aria-label="Numerator" inputmode="numeric" autocomplete="off" value="${esc(value.n??'')}"${disabled}/><i aria-hidden="true"></i><b aria-label="Fixed denominator ${r.fixedDenominator}">${r.fixedDenominator}</b></div></div>`;
  return `<fieldset class="pv-paired-answer"><legend>${esc(r.input_label||'Complete both forms')}</legend><div class="pv-paired-fields">${guided?field('count',r.fixedDenominator===10?'Number of tenths':'Number of hundredths','numeric')+fraction:fraction+field('decimal','Decimal','decimal')}</div><p>The denominator is already printed. Enter only its numerator and complete the other blank.</p></fieldset>`;
 }
 function formsMarkup(q,saved,locked){const value=saved&&typeof saved==='object'?saved:{},disabled=locked?' disabled':'',input=(key,label)=>`<input data-pv-field="${key}" aria-label="${label}" inputmode="${key==='decimal'?'decimal':'numeric'}" autocomplete="off" value="${esc(value[key]??'')}"${disabled}/>`;return `<fieldset class="pv-paired-answer"><legend>${esc(q.response.input_label||'Complete every requested form')}</legend><div class="pv-paired-fields">${q.response.fields.map(key=>key==='n'?`<div class="pv-fraction-field"><span>Fraction</span><div class="fixed-fraction-builder">${input('n','Numerator')}<i aria-hidden="true"></i><b aria-label="Fixed denominator 100">100</b></div></div>`:`<label><span>${key==='decimal'?'Decimal':'Percentage'}</span><span class="pv-percent-input">${input(key,key==='decimal'?'Decimal':'Percentage')}${key==='percent'?'<b aria-label="percent">%</b>':''}</span></label>`).join('')}</div><p>${q.response.fields.includes('n')?'The denominator is printed; enter only the numerator. ':''}${q.response.fields.includes('percent')?'The percent sign is printed; enter only the percentage number.':''}</p></fieldset>`;}
 function read(root,q,partial){
  if(q.response.type==='percentage_change_fields')return window.RevilyPercentageChangeStructure.read(root,q,partial);
  if(q.response.type==='mixed_percentage_answer')return window.RevilyMixedPercentage.read(root,q,partial);
  if(q.response.type==='percentage_form')return window.RevilyPercentageComparison.read(root,q,partial);
  if(q.response.type==='measured_percentage_amount')return window.RevilyMeasuredPercentageAmount.read(root,q,partial);
  if(q.response.type==='money_percentage_amount')return window.RevilyMoneyPercentageAmount.read(root,q,partial);
  if(q.response.type==='method_choice_amount')return window.RevilyMethodChoiceAmount.read(root,q,partial);
  if(q.response.type==='decimal_multiplier_amount')return window.RevilyDecimalMultiplierAmount.read(root,q,partial);
  if(q.response.type==='one_percent_amount')return window.RevilyOnePercentAmount.read(root,q,partial);
  if(q.response.type==='percentage_fraction_amount')return window.RevilyPercentageFractionAmount.read(root,q,partial);
  if(q.response.type==='mixed_fdp_forms')return window.RevilyMixedFDP.read(root,q,partial);
  if(q.response.type==='fdp_ordering')return window.RevilyFDPOrdering.read(root,q,partial);
  if(q.response.type==='fdp_comparison')return window.RevilyFDPComparison.read(root,q,partial);
  if(q.response.type==='percent_fraction')return window.RevilyPercentFraction.read(root,q,partial);
  if(q.response.type==='decimal_percent')return window.RevilyDecimalPercent.read(root,q,partial);
  if(q.response.type==='equivalent_percent')return window.RevilyEquivalentPercent.read(root,q,partial);
  if(q.response.type==='equivalent_decimal')return window.RevilyEquivalentDecimal.read(root,q,partial);
  if(q.response.type==='power_ten_fields')return window.RevilyPowerTenDecimal.read(root,q,partial);
  if(['decimal_fraction','decimal_places_pair'].includes(q.response.type))return window.RevilyDecimalFraction.read(root,q,partial);
  if(q.response.type==='decimal_scale_pair')return window.RevilyDecimalScaling.read(root,q,partial);
  if(q.response.type==='benchmark_forms')return window.RevilyBenchmark.read(root,q,partial);
  if(q.response.type==='place_value_forms'){const value=Object.fromEntries(q.response.fields.map(key=>[key,root.querySelector(`[data-pv-field="${key}"]`)?.value.trim()||''])),complete=q.response.fields.every(key=>key==='decimal'?Boolean(decimal(value[key])):/^\d+$/.test(value[key]));return partial||complete?value:null;}
  const guided=q.response.pair_kind==='count_and_numerator',keys=guided?['count','n']:['n','decimal'],value=Object.fromEntries(keys.map(k=>[k,root.querySelector(`[data-pv-field="${k}"]`)?.value.trim()||'']));return partial||/^\d+$/.test(value.n)&&(guided?/^\d+$/.test(value.count):Boolean(decimal(value.decimal)))?value:null;
 }
 function grid(n,d,object='square'){
  if(object==='container')return `<svg class="pv-container" viewBox="0 0 180 250" aria-hidden="true"><rect x="36" y="15" width="100" height="220" rx="0" fill="#fff" stroke="#164e63" stroke-width="3"/>${Array.from({length:10},(_,i)=>`<rect data-pv-cell="${i}" data-shaded="${i<n}" x="36" y="${213-i*22}" width="100" height="22" fill="${i<n?'#38bdf8':'#fff'}" stroke="#64748b" stroke-width="1"/>`).join('')}<path d="M136 40 H160 V175 H136" fill="none" stroke="#164e63" stroke-width="5"/></svg>`;
  const columns=10,rows=d/10,cell=d===10?32:22,height=d===10?36:22;
  return `<svg class="pv-grid ${d===10?'pv-strip':'pv-square'}" viewBox="0 0 ${columns*cell+4} ${rows*height+4}" aria-hidden="true">${Array.from({length:d},(_,i)=>{const x=2+i%10*cell,y=2+Math.floor(i/10)*height,shaded=i<n;return `<rect data-pv-cell="${i}" data-shaded="${shaded}" x="${x}" y="${y}" width="${cell}" height="${height}" fill="${shaded?object==='field'?'#bbf7d0':'#7dd3fc':'#fff'}" stroke="#52667b" stroke-width="1"/>${object==='field'&&shaded?`<path d="M${x+11} ${y+4} l-6 10 h12 z M${x+11} ${y+14} v5" fill="#166534" stroke="#166534" stroke-width="2"/>`:''}`;}).join('')}</svg>`;
 }
 function chart(value){const digits=value.split('.')[1]||'';return `<table class="pv-chart"><caption>Decimal place values</caption><thead><tr><th>Ones</th><th>Tenths</th><th>Hundredths</th></tr></thead><tbody><tr><td>0</td><td>${digits[0]||'0'}</td><td>${digits[1]??'—'}</td></tr></tbody></table>`;}
 function steps(m){const place=m.denominator===10?'tenths':'hundredths';return m.steps||[`${m.decimal} has ${m.denominator===10?'one digit':'two digits'} after the decimal point: ${place}.`,`${m.numerator} ${place}; ${m.denominator} equal parts make one whole.`,`${m.numerator}/${m.denominator} = ${m.decimal}`];}
 function render(m,reveal,shown=1){
  let html=`<div class="pv-model"><h2>${esc(m.title)}</h2>${m.given?`<p class="pv-given">${math(m.given)}</p>`:''}`;
  const phase=m.phase||shown;
  if(m.mode==='principle')return html+(reveal?'<div class="pv-principle"><p>One decimal place ↔ tenths ↔ denominator 10</p><p>Two decimal places ↔ hundredths ↔ denominator 100</p></div>':'<p>The explanation is not shown.</p>')+'</div>';
  if(m.mode==='comparison')return html+(reveal?`<div class="pv-compare"><section><h3>0.8</h3>${grid(80,100)}<p>80 hundredths</p></section><section><h3>0.08</h3>${phase>=2?grid(8,100)+'<p>8 hundredths</p>':'<p>The second amount is compared on the next line.</p>'}</section></div>${phase>=3?`<p>${math('0.8 > 0.08')}</p>`:''}`:'<p>The comparison and explanation are not shown.</p>')+'</div>';
  if(m.model_given||reveal){html+=`<figure>${grid(m.numerator,m.denominator,m.object)}<figcaption>${esc(m.model_caption||`One whole, divided into ${m.denominator} equal parts.`)}</figcaption></figure>`;}
  if(reveal){html+=chart(m.decimal);html+=`<ol class="pv-value-steps">${steps(m).slice(0,phase).map(line=>`<li>${math(line)}</li>`).join('')}</ol>`;}else html+=m.explanation_question?'<p>The explanation is not shown.</p>':'<p>The completed forms are not shown.</p>';
  return html+'</div>';
 }
 function accessible(m,reveal,shown=1){
  const base=m.title+'. '+(m.given?m.given+'. ':'');
  if(m.mode==='principle')return base+(reveal?'One decimal place means tenths, denominator ten. Two decimal places mean hundredths, denominator one hundred.':'The explanation is not shown.');
  if(m.mode==='comparison')return base+(reveal?'A hundred-square shows eighty hundredths.'+(shown>=2?' An equal-sized hundred-square shows eight hundredths.':' The second amount is compared on the next line.')+(shown>=3?' Zero point eight is greater than zero point zero eight.':' The comparison symbol is not shown.'):'The comparison and explanation are not shown.');
  const model=m.model_given||reveal?`${m.object||'Diagram'}: one whole divided into ${m.denominator} equal ${m.object==='container'?'intervals':'parts'}, with ${m.numerator} ${m.object==='field'?'planted with trees':m.object==='container'?'filled':'shaded'}. `:'';
  return base+model+(reveal?steps(m).slice(0,m.phase||shown).join(' '):m.explanation_question?'The explanation is not shown.':'The completed forms are not shown.');
 }
 window.RevilyPlaceValue={decimal,sameDecimal,evidence,markup,read,grid,render,accessible};
})();
