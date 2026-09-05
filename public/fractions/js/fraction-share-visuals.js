(function () {
  'use strict';
  const esc=value=>window.RevilyVisuals.escapeHtml(String(value));
  const math=value=>window.RevilyVisuals.mathMarkup(value);
  const line=(value,klass='')=>'<p class="'+klass+'">'+math(value)+'</p>';
  function exact(m) {
    if(![m.n,m.d,m.divisor].every(Number.isSafeInteger)||Math.min(m.n,m.d,m.divisor)<1)throw new Error('Fraction sharing requires positive integer fraction parts and a positive whole-number divisor.');
    return window.RevilyValidators.parseRational(m.n+'/'+(m.d*m.divisor));
  }
  function phaseFor(m,reveal,shown=1,feedback='') {
    if(!reveal)return m.phase||'given';
    if(feedback==='support'&&m.support_phases)return m.support_phases[Math.min(shown-1,m.support_phases.length-1)];
    if(m.resultScope)return m.resultScope;
    const phases=m.working_phases||['keep','reciprocal','multiply','raw','simplified'];
    return phases[Math.min(shown-1,phases.length-1)];
  }
  function bar(selected,parts,label,klass='os-water') {
    const wholes=Math.ceil(selected/parts);
    let out='<div class="os-share-quantity">'+line(label);
    for(let whole=0;whole<wholes;whole++) {
      out+='<div class="os-share-bar" style="grid-template-columns:repeat('+parts+',minmax(0,1fr))" data-reference-whole="'+(whole+1)+'">';
      for(let part=0;part<parts;part++)out+='<span class="'+(whole*parts+part<selected?klass:'os-empty')+'" data-share-cell="" data-selected="'+(whole*parts+part<selected)+'"></span>';
      out+='</div>';
    }
    return out+'</div>';
  }
  function shareBars(m,phase) {
    let out='<div class="os-share-bars">'+line('Every complete bar represents one whole.','os-share-reference');
    if(phase==='given')return out+bar(m.n,m.d,'Original amount: '+m.n+'/'+m.d)+line(m.divisor+' equal shares are needed; each share is unknown.')+'</div>';
    out+=bar(m.n*m.divisor,m.d*m.divisor,'Same original amount: '+m.n+'/'+m.d+' = '+m.n*m.divisor+'/'+(m.d*m.divisor));
    if(phase==='partition')return out+line('Each original part has been split into '+m.divisor+' equal smaller parts.')+'</div>';
    const answer=exact(m),raw=m.n+'/'+(m.d*m.divisor),simple=answer.n+'/'+answer.d;
    for(let share=0;share<m.divisor;share++)out+=bar(m.n,m.d*m.divisor,'Share '+(share+1)+': '+raw+(raw===simple?'':' = '+simple),share%2?'os-mixed-second':'os-selected');
    return out+line('Together, the '+m.divisor+' equal shares restore '+m.n+'/'+m.d+'.')+'</div>';
  }
  function vessel(fill,type,smaller=false) {
    const color=type==='paint'?'os-paint':'os-juice',height=88*fill,top=smaller?59:15,bodyHeight=105-top;
    return '<svg viewBox="0 0 130 125" aria-hidden="true" focusable="false"><rect x="20" y="'+top+'" width="80" height="'+bodyHeight+'" rx="2" class="os-empty"/>'+(fill?'<rect x="22" y="'+(103-height)+'" width="76" height="'+height+'" class="'+color+'"/>':'')+(type==='jug'?'<path d="M101 28 h18 v43 h-18" class="os-bracket"/>':'')+'<path d="M20 '+top+' V105 h80 V'+top+'" class="os-capacity-outline"/></svg>';
  }
  function dough(fill) {
    const r=42*Math.sqrt(fill);
    return '<svg viewBox="0 0 130 125" aria-hidden="true" focusable="false">'+(fill?'<circle cx="65" cy="62" r="'+r+'" class="os-dough"/>':'<path d="M25 75 q40 32 80 0" class="os-bracket"/>')+'</svg>';
  }
  function context(m,solved) {
    const result=exact(m),value=m.n+'/'+m.d,answer=result.n+'/'+result.d;
    if(m.object==='ribbon') {
      let out='<div class="os-share-context">'+line('Original ribbon: '+value+' m')+line('Reference length: 1 metre','os-share-reference');
      out+='<div class="os-share-ribbon-reference"><div class="os-share-ribbon" style="width:'+100*m.n/m.d+'%">';
      for(let i=0;i<(solved?m.divisor:1);i++)out+='<span style="width:'+100/(solved?m.divisor:1)+'%" class="'+(i%2?'os-mixed-second':'os-ribbon-given')+'"></span>';
      return out+'</div></div>'+line(m.divisor+' equal pieces; each length '+(solved?answer+' m':'? m'))+'</div>';
    }
    if(!['juice','paint','dough'].includes(m.object))throw new Error('Unknown fraction-sharing context: '+m.object);
    const mass=m.object==='dough',noun=mass?'Dough':m.object==='juice'?'Juice':'Paint',unit=m.unit||'',portion=mass?'Portion':m.object==='juice'?'Glass':'Container';
    let out='<div class="os-share-context">'+line((solved?'Original '+noun.toLowerCase():noun+' available')+': '+value+' '+unit);
    out+='<div class="os-share-object">'+(mass?dough(m.n/m.d):vessel(m.n/m.d,m.object==='juice'?'jug':'paint'))+'</div>';
    out+=line((solved?'Shared into ':'')+m.divisor+' equal '+(mass?'portions':m.object==='juice'?'glasses':'containers'))+'<div class="os-share-recipients">';
    for(let i=0;i<m.divisor;i++)out+='<div class="os-share-recipient">'+(mass?dough(solved?m.n/m.d/m.divisor:0):vessel(solved?m.n/m.d/m.divisor:0,m.object,m.object==='paint'))+line(portion+' '+(i+1))+line(solved?answer+' '+unit:'? '+unit)+'</div>';
    out+='</div>'+line(mass?'Circle area represents mass.':'Liquid height uses the same one-litre scale.','os-share-reference');
    return out+'</div>';
  }
  function render(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='fraction_share_rule')return '<div class="os-decision-question"><p>A fractional amount</p><span>÷</span><p>A positive whole number</p></div>';
    const result=exact(m),phase=phaseFor(m,reveal,shown,feedback),original=m.n+'/'+m.d,raw=m.n+'/'+(m.d*m.divisor),answer=result.n+'/'+result.d,k=m.divisor;
    if(['partition','shares'].includes(phase)||phase==='given'&&m.object==='bar')return shareBars(m,phase);
    if(m.object!=='symbolic'&&m.object!=='bar'&&['given','simplified'].includes(phase))return context(m,phase==='simplified');
    let out='<div class="os-share-equation" data-share-phase="'+esc(phase)+'">';
    if(phase==='stated_result')out+=line(original+' ÷ '+k+' = '+answer);
    else if(phase==='given'||phase==='division')out+=line(original+' ÷ '+k+' = ?');
    else if(phase==='keep')out+=line('Keep the starting amount')+line(original)+line('The divisor is '+k+'.','os-share-reference');
    else if(phase==='divisor_given')out+=line('Whole-number divisor: '+k)+line('Its reciprocal: ?');
    else if(phase==='whole_divisor')out+=line('Represent the divisor without changing it')+line(k+' = '+k+'/1');
    else if(phase==='reciprocal')out+=line('Only the divisor changes to its reciprocal')+line(k+'/1 → 1/'+k);
    else if(phase==='missing_multiplier')out+=line(original+' ÷ '+k)+line('= '+original+' × ?');
    else if(phase==='multiply')out+=line(original+' ÷ '+k)+line('= '+original+' × 1/'+k);
    else if(phase==='raw')out+=line(m.n+' × 1 = '+m.n)+line(m.d+' × '+k+' = '+m.d*k)+line('Exact product: '+raw);
    else if(phase==='simplified') {
      const factor=BigInt(m.n)/result.n;
      out+=line(raw===answer?'Already in simplest form':'Simplify without changing the value');
      if(factor>1n)out+=line(m.n+' ÷ '+factor+' = '+result.n)+line(m.d*k+' ÷ '+factor+' = '+result.d);
      out+=line(raw+(raw===answer?'':' = '+answer));
    } else throw new Error('Unknown fraction-sharing phase: '+phase);
    return out+'</div>';
  }
  function accessible(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='fraction_share_rule')return 'Choose a valid method for a fractional amount divided by a positive whole number.';
    const result=exact(m),phase=phaseFor(m,reveal,shown,feedback),given=m.n+' over '+m.d,k=m.divisor;
    if(phase==='stated_result')return 'Given calculation: '+given+' divided by '+k+' equals '+result.n+' over '+result.d+'. Choose why this is correct.';
    if(phase==='partition')return 'The same '+given+' is repartitioned as '+m.n*k+' over '+m.d*k+'. Each original part is split into '+k+' equal smaller parts. The individual share is not shown.';
    if(phase==='shares')return k+' equal shares, each '+m.n+' over '+m.d*k+', or '+result.n+' over '+result.d+'. Their combined amount is '+given+'. Every full bar represents the same whole.';
    if(phase==='given'&&m.object!=='symbolic')return m.object+' total '+given+' '+(m.unit||'whole')+'; '+k+' equal shares are required. The amount in one share is not shown.';
    if(phase==='keep')return 'Starting amount '+given+' stays unchanged. Whole-number divisor '+k+'.';
    if(phase==='divisor_given')return 'The whole-number divisor is '+k+'. Its reciprocal is not shown.';
    if(phase==='whole_divisor')return 'The divisor '+k+' is written as '+k+' over one, with unchanged value.';
    if(phase==='reciprocal')return 'Only the divisor changes: '+k+' over one becomes one over '+k+'.';
    if(phase==='missing_multiplier')return given+' divided by '+k+' equals '+given+' multiplied by an unknown fraction.';
    if(phase==='multiply')return given+' divided by '+k+' equals '+given+' multiplied by one over '+k+'. The product is not yet shown.';
    if(phase==='raw')return 'Numerator product '+m.n+' times one gives '+m.n+'; denominator product '+m.d+' times '+k+' gives '+m.d*k+'. Exact product '+m.n+' over '+m.d*k+'.';
    if(phase==='simplified')return (m.object!=='symbolic'&&m.object!=='bar'?k+' equal '+m.object+' shares, each ':'Simplified exact share: ')+result.n+' over '+result.d+' '+(m.unit||'')+'. The original total is '+given+'.';
    return given+' divided by '+k+'. The requested result is not shown.';
  }
  window.RevilyFractionShareVisuals={render,accessible,phaseFor,exactResult:exact};
})();
