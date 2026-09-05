(function () {
  'use strict';
  const digits=value=>/^\d{1,6}$/.test(String(value??''));
  const finalQuestion=q=>({response:q.response.final_response?{...q.response.final_response}:{type:q.response.result_type,require_simplest_form:true,input_label:'Final product'},answer:{value:q.answer.value.result}});
  function classify(q,response) {
    if(!response||!Array.isArray(response.conversions)||response.conversions.length!==q.response.factors.length)return 'missing_conversion';
    if(q.response.conversion_kind==='common_denominator') {
      for(let i=0;i<q.response.factors.length;i++) {
        const factor=q.response.factors[i],converted=response.conversions[i];
        if(!converted||!digits(converted.n)||!digits(converted.d)||BigInt(converted.d)===0n)return 'missing_conversion';
        if(!window.RevilyValidators.sameRational(converted,`${factor.n}/${factor.d}`))return 'incorrect_conversion';
      }
      if(response.conversions.some(c=>BigInt(c.d)!==BigInt(response.conversions[0].d)))return 'denominators_differ';
      if(q.response.common_denominator_operation==='subtract') {
        const expected=window.RevilyValidators.parseRational(q.answer.value.result);
        if(expected&&window.RevilyValidators.sameRational(response.result,{n:-expected.n,d:expected.d}))return 'reversed_order';
      }
      return window.RevilyValidators.validate(finalQuestion(q),response.result)?'correct':'incorrect_product';
    }
    for(let i=0;i<q.response.factors.length;i++) {
      const factor=q.response.factors[i],converted=response.conversions[i];
      if(!converted||!digits(converted.n)||!digits(converted.d))return 'missing_conversion';
      if(q.response.allow_equivalent_conversions===true) {
        const expected={n:BigInt(factor.whole)*BigInt(factor.d)+BigInt(factor.n),d:BigInt(factor.d)};
        if(window.RevilyValidators.sameRational(converted,expected))continue;
        if(BigInt(converted.n)===BigInt(factor.n)&&BigInt(converted.d)===BigInt(factor.d))return 'omitted_whole';
        return 'incorrect_conversion';
      }
      if(BigInt(converted.d)!==BigInt(factor.d))return 'changed_denominator';
      const expected=BigInt(factor.whole)*BigInt(factor.d)+BigInt(factor.n);
      if(BigInt(converted.n)!==expected)return BigInt(converted.n)===BigInt(factor.n)?'omitted_whole':'incorrect_conversion';
    }
    const final=finalQuestion(q);
    if(window.RevilyValidators.validate(final,response.result))return 'correct';
    try {if(window.RevilyValidators.sameRational(response.result,final.answer.value))return 'wrong_form';} catch(_error) { /* Incomplete or malformed values are not valid evidence. */ }
    return 'incorrect_product';
  }
  function markup(q,saved,locked,renderFinal) {
    const value=saved&&typeof saved==='object'?saved:{},esc=window.RevilyVisuals.escapeHtml,math=window.RevilyVisuals.mathMarkup,disabled=locked?' disabled':'';
    return `<section class="os-conversion-working" aria-label="${q.response.conversion_kind==='common_denominator'?'Your equivalent fractions':'Your mixed-number conversions'}"><div class="os-conversion-grid">${q.response.factors.map((factor,index)=>{
      const conversion=value.conversions?.[index]||{},position=factor.position||(index===0?'First':'Second');
      return `<fieldset class="fraction-answer" data-conversion-index="${index}"><legend>${position} conversion: ${math(q.response.conversion_kind==='common_denominator'?`${factor.n}/${factor.d}`:`${factor.whole} ${factor.n}/${factor.d}`)}</legend><div class="fraction-input"><input data-conversion-part="n" aria-label="${position} conversion numerator" inputmode="numeric" maxlength="6" value="${esc(String(conversion.n??''))}"${disabled}/><i aria-hidden="true"></i><input data-conversion-part="d" aria-label="${position} conversion denominator" inputmode="numeric" maxlength="6" value="${esc(String(conversion.d??''))}"${disabled}/></div></fieldset>`;
    }).join('')}</div>${renderFinal(finalQuestion(q),value.result,locked)}</section>`;
  }
  function read(root,q,partial=false,readFinal) {
    const conversions=q.response.factors.map((_,index)=>Object.fromEntries(['n','d'].map(part=>[part,root.querySelector(`[data-conversion-index="${index}"] [data-conversion-part="${part}"]`)?.value.trim()||''])));
    if(q.response.final_response) {
      if(typeof readFinal!=='function')throw new Error('A configured final response needs its shared input reader.');
      const result=readFinal(finalQuestion(q),partial),value={conversions,result};
      if(partial)return value;
      return conversions.some(c=>!digits(c.n)||!digits(c.d)||BigInt(c.d)===0n)||result===null?null:value;
    }
    const result=q.response.result_type==='mixed_number'?{whole:root.querySelector('#mixed-whole')?.value.trim()||'',n:root.querySelector('#mixed-n')?.value.trim()||'',d:root.querySelector('#mixed-d')?.value.trim()||''}:root.querySelector('#integer-answer')?.value.trim()||'';
    const value={conversions,result};if(partial)return value;
    if(conversions.some(c=>!digits(c.n)||!digits(c.d)||BigInt(c.d)===0n))return null;
    if(typeof result==='string')return digits(result)?value:null;
    return Object.values(result).every(digits)&&BigInt(result.d)!==0n?value:null;
  }
  window.RevilyConversionProduct={classify,finalQuestion,markup,read};
})();
