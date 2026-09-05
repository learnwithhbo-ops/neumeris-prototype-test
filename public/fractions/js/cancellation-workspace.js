(function () {
  'use strict';
  const keys=['a','b','c','d'];
  const names={a:'Left numerator',b:'Left denominator',c:'Right numerator',d:'Right denominator'};
  const top=k=>k==='a'||k==='c';
  const integer=v=>/^\d{1,6}$/.test(String(v??'')) ? Number(v) : null;
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  const esc=v=>window.RevilyVisuals.escapeHtml(String(v??''));
  const initial=q=>Object.fromEntries(keys.map((k,i)=>[k,q.response.factors[i]]));
  const entryComplete=e=>e&&keys.includes(e.first)&&keys.includes(e.second)&&['divisor','firstAfter','secondAfter'].every(k=>integer(e[k])!==null);
  function classify(q,response) {
    if(!response||typeof response!=='object')return 'missing_working';
    const values=initial(q),originalN=values.a*values.c,originalD=values.b*values.d;
    if(response.method==='multiply') {
      if(q.response.require_cancellation||q.response.fixed_pair)return 'missing_working';
      if(integer(response.rawN)!==originalN||integer(response.rawD)!==originalD)return 'incorrect_product';
    } else if(response.method==='cancel') {
      if(!Array.isArray(response.steps)||!response.steps.length)return 'missing_working';
      for(const step of response.steps) {
        if(!entryComplete(step))return 'missing_working';
        const {first,second}=step,factor=integer(step.divisor);
        if(first===second||top(first)===top(second))return 'invalid_positions';
        if(q.response.fixed_pair&&!q.response.fixed_pair.every(k=>[first,second].includes(k)))return 'wrong_pair';
        if(factor<=1||values[first]%factor||values[second]%factor)return 'not_common_factor';
        if(integer(step.firstAfter)!==values[first]/factor||integer(step.secondAfter)!==values[second]/factor)return 'unequal_change';
        values[first]/=factor;values[second]/=factor;
      }
      if(q.response.fixed_pair) {
        const [first,second]=q.response.fixed_pair;
        return gcd(values[first],values[second])===1?'correct':'unfinished_cancellation';
      }
    } else return 'missing_working';
    const n=integer(response.n),d=integer(response.d);
    if(n===null||!d||BigInt(n)*BigInt(originalD)!==BigInt(d)*BigInt(originalN))return 'incorrect_product';
    return gcd(n,d)===1?'correct':'not_simplest';
  }
  function statedValues(q,steps=[]) {
    const values=initial(q);
    // These are the learner's recorded replacements, not a correctness hint.
    for(const step of steps)for(const [key,value] of [[step.first,step.firstAfter],[step.second,step.secondAfter]])if(keys.includes(key))values[key]=value;
    return values;
  }
  function expression(values) {
    const f=window.RevilyVisuals.fractionMarkup;
    return `${f(values.a,values.b)} <span aria-hidden="true">×</span> ${f(values.c,values.d)}`;
  }
  function markup(q,saved={},locked=false) {
    const value=saved&&typeof saved==='object'?saved:{},method=q.response.fixed_pair||q.response.require_cancellation?'cancel':value.method||'cancel';
    const steps=(locked?value.steps:value.committedSteps||value.steps)||[],entry=value.entry||{},values=statedValues(q,steps),disabled=locked?' disabled':'';
    const field=(key,label,current)=>`<label><span>${esc(label)}</span><input data-cancel-field="${key}" aria-label="${esc(label)}" inputmode="numeric" autocomplete="off" maxlength="6" value="${esc(current)}"${disabled}/></label>`;
    const select=(key,label)=>`<label><span>${label}</span><select data-cancel-field="${key}" aria-label="${label}"${disabled}><option value="">Choose a position</option>${keys.map(k=>`<option value="${k}"${entry[key]===k?' selected':''}>${names[k]} (${esc(values[k])})</option>`).join('')}</select></label>`;
    const fixed=q.response.fixed_pair;
    const first=fixed?.[0]||entry.first,second=fixed?.[1]||entry.second;
    const fraction=(prefix,label,n,d)=>`<fieldset class="fraction-answer"><legend>${label}</legend><div class="os-fraction-fields"><div class="fraction-input"><input id="${prefix}-n" aria-label="${prefix==='fraction'?'Numerator':'Unsimplified numerator'}" inputmode="numeric" maxlength="6" value="${esc(n)}"${disabled}/><i aria-hidden="true"></i><input id="${prefix}-d" aria-label="${prefix==='fraction'?'Denominator':'Unsimplified denominator'}" inputmode="numeric" maxlength="6" value="${esc(d)}"${disabled}/></div>${prefix==='fraction'&&q.response.suffix?`<b aria-label="${esc(q.response.suffix_label||q.response.suffix)}">${esc(q.response.suffix)}</b>`:''}</div></fieldset>`;
    return `<section class="os-cancellation" data-method="${method}" data-steps="${esc(JSON.stringify(steps))}" aria-label="Your calculation working">
      ${!fixed&&!q.response.require_cancellation?`<div class="os-methods" role="group" aria-label="Calculation method"><button type="button" class="secondary-button" data-method-choice="cancel" aria-pressed="${method==='cancel'}"${disabled}>Cancel before multiplying</button><button type="button" class="secondary-button" data-method-choice="multiply" aria-pressed="${method==='multiply'}"${disabled}>Multiply then simplify</button></div>`:''}
      <div data-cancel-route${method==='cancel'?'':' hidden'}>
        <p class="os-cancel-expression" aria-label="${esc(`Your current expression: ${values.a} over ${values.b} multiplied by ${values.c} over ${values.d}`)}">${expression(values)}</p>
        ${steps.length?`<ol class="os-cancel-history" aria-label="Recorded cancellation steps">${steps.map(step=>`<li>${esc(names[step.first])} and ${esc(names[step.second])}: divide both by ${esc(step.divisor)}; replacements ${esc(step.firstAfter)} and ${esc(step.secondAfter)}.</li>`).join('')}</ol>`:''}
        ${locked?'':`<fieldset class="os-cancel-entry"><legend>${steps.length?'Next cancellation (optional)':'Record a cancellation'}</legend>${fixed?`<p>${names[first]} (${esc(values[first])}) and ${names[second]} (${esc(values[second])})</p><input type="hidden" data-cancel-field="first" value="${first}"/><input type="hidden" data-cancel-field="second" value="${second}"/>`:select('first','First position')+select('second','Second position')}${field('divisor','Divide both by',entry.divisor)}${field('firstAfter','First replacement',entry.firstAfter)}${field('secondAfter','Second replacement',entry.secondAfter)}</fieldset>`}
        ${locked?'':`<div class="os-cancel-actions"><button type="button" class="secondary-button" data-cancel-add>Record step</button><button type="button" class="secondary-button" data-cancel-undo${steps.length?'':' disabled'}>Edit last step</button></div><p class="os-answer-help">Your replacements are recorded as entered. Check answer checks the working. Different valid orders and smaller common factors are accepted.</p>`}
      </div>
      <div data-multiply-route${method==='multiply'?'':' hidden'}>${!fixed?fraction('raw','Unsimplified product',value.rawN,value.rawD):''}</div>
      ${!fixed?fraction('fraction','Final product in simplest form',value.n,value.d):''}
    </section>`;
  }
  function read(root,q,partial=false) {
    const area=root.querySelector('.os-cancellation');if(!area)return null;
    const entry=Object.fromEntries(['first','second','divisor','firstAfter','secondAfter'].map(key=>[key,area.querySelector(`[data-cancel-field="${key}"]`)?.value.trim()||'']));
    const committedSteps=JSON.parse(area.dataset.steps||'[]'),steps=[...committedSteps];
    const pending=['divisor','firstAfter','secondAfter'].some(k=>entry[k])||(!q.response.fixed_pair&&(entry.first||entry.second));
    if(pending)steps.push(entry);
    const value={method:area.dataset.method,steps,committedSteps,entry,n:area.querySelector('#fraction-n')?.value.trim()||'',d:area.querySelector('#fraction-d')?.value.trim()||'',rawN:area.querySelector('#raw-n')?.value.trim()||'',rawD:area.querySelector('#raw-d')?.value.trim()||''};
    if(partial)return value;
    if(value.method==='cancel'&&(!steps.length||steps.some(step=>!entryComplete(step))))return null;
    if(value.method==='multiply'&&[value.rawN,value.rawD].some(v=>integer(v)===null))return null;
    if(!q.response.fixed_pair&&(integer(value.n)===null||!integer(value.d)))return null;
    return value;
  }
  function bind(engine,q) {
    const form=engine.root.querySelector('#answer-form');
    const save=()=>{engine.state.drafts[q.id]=read(engine.root,q,true);engine.updateSubmitAvailability(q);engine.persist();
      const area=form.querySelector('.os-cancellation'),entry=engine.state.drafts[q.id].entry;
      area.querySelector('[data-cancel-add]')?.toggleAttribute('disabled',!entryComplete(entry));};
    const repaint=value=>{form.querySelector('.os-cancellation').outerHTML=markup(q,value);save();};
    form.addEventListener('input',save);form.addEventListener('change',save);
    form.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button||button.disabled)return;
      const value=read(engine.root,q,true);
      if(button.hasAttribute('data-cancel-add')) {
        if(!entryComplete(value.entry))return;
        value.committedSteps.push(value.entry);value.entry={};value.steps=value.committedSteps;repaint(value);
        form.querySelector('[data-cancel-field="divisor"]')?.focus({preventScroll:true});
      } else if(button.hasAttribute('data-cancel-undo')) {
        value.entry=value.committedSteps.pop()||{};value.steps=value.committedSteps;repaint(value);
        form.querySelector('[data-cancel-field="divisor"]')?.focus({preventScroll:true});
      } else if(button.dataset.methodChoice) {
        value.method=button.dataset.methodChoice;repaint(value);
        form.querySelector(`[data-method-choice="${value.method}"]`)?.focus({preventScroll:true});
      }
    });
    save();
  }
  window.RevilyCancellation={classify,initial,statedValues,markup,read,bind,entryComplete};
})();
