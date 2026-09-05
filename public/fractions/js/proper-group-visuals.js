(function () {
  'use strict';
  const esc=value=>window.RevilyVisuals.escapeHtml(String(value));
  const line=(value,klass='')=>'<p class="'+klass+'">'+window.RevilyVisuals.mathMarkup(value)+'</p>';
  function exact(m) {
    if(![m.wholes,m.n,m.d].every(Number.isSafeInteger)||m.wholes<1||m.n<2||m.n>=m.d)throw new Error('Proper-fraction grouping requires a positive whole amount and a non-unit proper divisor.');
    return window.RevilyValidators.parseRational({n:m.wholes*m.d,d:m.n});
  }
  const format=p=>p.d===1n?String(p.n):p.n+'/'+p.d;
  function phaseFor(m,reveal,shown=1,feedback='') {
    if(!reveal)return m.phase||'given';
    if(feedback==='support'&&m.support_phases)return m.support_phases[Math.min(shown-1,m.support_phases.length-1)];
    if(m.resultScope)return m.resultScope;
    const phases=m.working_phases||['whole_fraction','reciprocal','raw','simplified'];
    return phases[Math.min(shown-1,phases.length-1)];
  }
  function parts(m,count,label,klass='') {
    return '<div class="os-pg-card '+klass+'">'+line(label)+'<div class="os-pg-reference"><div class="os-pg-parts" style="width:'+100*count/m.d+'%;grid-template-columns:repeat('+count+',minmax(0,1fr))">'+Array.from({length:count},()=>'<span data-proper-small-part=""></span>').join('')+'</div></div></div>';
  }
  function wholes(m,partition) {
    return '<div class="os-pg-card-grid">'+Array.from({length:m.wholes},(_,i)=>partition?parts(m,m.d,'Whole '+(i+1)):'<div class="os-pg-card">'+line('Whole '+(i+1))+'<div class="os-pg-reference"><div class="os-pg-unpartitioned"></div></div></div>').join('')+'</div>';
  }
  function groups(m) {
    const total=m.wholes*m.d,full=Math.floor(total/m.n),rest=total%m.n,p=exact(m);
    let out=line('Each full reference width still represents one whole.','os-pg-note')+'<div class="os-pg-card-grid">';
    for(let i=0;i<full;i++)out+=parts(m,m.n,'Group '+(i+1),'os-pg-complete-group');
    if(rest)out+=parts(m,rest,format(window.RevilyValidators.parseRational({n:rest,d:m.n}))+' of one more group','os-pg-partial-group');
    return out+'</div>'+line('Group count: '+format(p))+line('Each complete group has size '+m.n+'/'+m.d+'.','os-pg-note');
  }
  function vessel(kind) {
    if(kind==='container')return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M20 15 H72 V95 H20 Z" class="os-pg-water"/><path d="M20 8 V100 H72 V8 M72 25 Q103 25 90 65 H72" class="os-pg-outline"/></svg>';
    if(kind==='bottle')return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M40 8 H60 V28 L75 42 V100 H25 V42 L40 28 Z" class="os-pg-water"/><path d="M40 17 H60" class="os-pg-outline"/></svg>';
    return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M25 10 H75 L63 29 Q98 61 84 100 H16 Q2 61 37 29 Z" class="os-pg-flour"/><path d="M33 30 H67" class="os-pg-outline"/></svg>';
  }
  function context(m,solved=false) {
    const p=exact(m),count=Number(p.n/p.d),ribbon=m.object==='ribbon'||m.object==='cable';
    if(solved&&p.d!==1n)throw new Error('Complete-piece contexts require an exact whole number of groups.');
    if(ribbon) {
      const name=m.object==='cable'?'cable':'ribbon';
      let out='<div class="os-pg-length" data-length-object="'+name+'">'+line((solved?'Cut ':'Original ')+name+': '+m.wholes+' m')+'<div class="os-pg-length-track">';
      for(let i=0;i<(solved?count:1);i++)out+='<span'+(solved?' data-proper-piece=""':'')+'></span>';
      out+='</div>'+line('One piece: '+m.n+'/'+m.d+' m');
      out+='<div class="os-pg-piece-reference"><span style="width:'+100*m.n/(m.d*m.wholes)+'%"></span></div>';
      return out+line('The reference width is the full original length.','os-pg-note')+line('Number of pieces: '+(solved?count:'?'))+'</div>';
    }
    const water=m.object==='water',name=water?'bottle':'bag',unit=water?'litre':'kg';
    let out='<div class="os-pg-context">'+line((water?'Water available: ':'Flour available: ')+m.wholes+' '+(water?'litres':'kg'));
    if(!solved)out+='<div class="os-pg-vessels"><figure>'+vessel(water?'container':'bag')+line(water?'Original container':'Original flour')+'</figure><figure>'+vessel(water?'bottle':'bag')+line('One '+name+': '+m.n+'/'+m.d+' '+unit)+'</figure></div>'+line('Number of full '+name+'s: ?');
    else out+=line('Packed into '+count+' '+name+'s')+'<div class="os-pg-vessels">'+Array.from({length:count},(_,i)=>'<figure data-proper-recipient="">'+vessel(water?'bottle':'bag')+line(name[0].toUpperCase()+name.slice(1)+' '+(i+1))+line(m.n+'/'+m.d+' '+unit)+'</figure>').join('')+'</div>';
    return out+'</div>';
  }
  function render(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='proper_groups_rule')return '<div class="os-decision-question"><p>A whole-number amount</p><span>÷</span><p>A proper-fraction group size</p></div>';
    const p=exact(m),phase=phaseFor(m,reveal,shown,feedback),w=m.wholes,n=m.n,d=m.d,raw=w*d+'/'+n;
    const contextual=['ribbon','cable','water','flour'].includes(m.object);
    let out='<div class="os-proper-groups" data-proper-phase="'+esc(phase)+'" data-proper-context="'+esc(m.object)+'">';
    if(phase==='given')out+=contextual?context(m):line(w+' ÷ '+n+'/'+d)+wholes(m,false)+parts(m,n,'One group: '+n+'/'+d)+line('Number of groups: ?');
    else if(phase==='small_parts')out+=line(w+' wholes = '+w*d+' parts of size 1/'+d)+wholes(m,true);
    else if(phase==='grouped')out+=groups(m);
    else if(phase==='count_rule')out+=line(w*d+' small parts, '+n+' in each group')+line(w*d+' ÷ '+n+' = '+format(p))+line(w+' ÷ '+n+'/'+d+' = '+w+'/1 × '+d+'/'+n+' = '+format(p));
    else if(phase==='stated_result')out+=line(w+' ÷ '+n+'/'+d+' = '+format(p))+line('Why is this correct?');
    else if(phase==='whole_unknown')out+=line('Write '+w+' as a fraction over 1.')+line(w+' = ?');
    else if(phase==='whole_fraction')out+=line(w+' ÷ '+n+'/'+d)+line('Keep the starting amount: '+w+' = '+w+'/1');
    else if(phase==='divisor_given')out+=line('Divisor: '+n+'/'+d)+line('Reciprocal: ?');
    else if(phase==='reciprocal_only')out+=line('Divisor: '+n+'/'+d)+line('Reciprocal: '+d+'/'+n);
    else if(phase==='reciprocal')out+=line('Keep the starting amount; reverse only the divisor.')+line(w+'/1 ÷ '+n+'/'+d)+line('= '+w+'/1 × '+d+'/'+n);
    else if(phase==='multiply')out+=line(w+'/1 × '+d+'/'+n+' = ?');
    else if(phase==='raw')out+=line(w+' × '+d+' = '+w*d)+line('1 × '+n+' = '+n)+line('Product: '+raw);
    else if(phase==='raw_unknown')out+=line(raw+' = ?')+line('Find the exact value.');
    else if(phase==='simplified')out+=line(raw+' = '+format(p))+(contextual?context(m,true):line('The positive group count is larger than the original whole-number amount.','os-pg-note'));
    else if(phase==='mixed') {
      const whole=p.n/p.d,rest=p.n%p.d;
      out+=line(format(p)+' = '+(rest?whole+' '+rest+'/'+p.d:whole));
      out+=line(rest?'The complete groups and the remaining fraction of a group make the same exact amount.':'The group count is a whole number.','os-pg-note');
    } else if(phase==='division')out+=line(w+' ÷ '+n+'/'+d)+line('This finds the number of equal-sized pieces.');
    else throw new Error('Unknown proper-fraction grouping phase: '+phase);
    return out+'</div>';
  }
  function accessible(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='proper_groups_rule')return 'Choose a method for a whole-number amount divided by a proper-fraction group size.';
    const p=exact(m),phase=phaseFor(m,reveal,shown,feedback),w=m.wholes,n=m.n,d=m.d;
    if(phase==='small_parts')return w+' wholes contain '+w*d+' equal parts, each one over '+d+'. No groups have been formed yet.';
    if(phase==='grouped')return 'The same '+w*d+' small parts form '+format(p)+' groups of size '+n+' over '+d+'. Each complete group contains '+n+' small parts. The full reference width remains one whole.';
    if(phase==='count_rule')return w*d+' small parts divided into '+n+' per group gives '+format(p)+' groups. This equals '+w+' over one multiplied by '+d+' over '+n+'. Both divisor numbers matter.';
    if(phase==='stated_result')return 'Given: '+w+' divided by '+n+' over '+d+' equals '+format(p)+'. Choose the reason.';
    if(phase==='whole_unknown')return 'The whole number '+w+' is to be written as a fraction over one. The completed fraction is not shown.';
    if(phase==='whole_fraction')return 'The starting amount remains '+w+', written as '+w+' over one. The divisor remains '+n+' over '+d+'.';
    if(phase==='divisor_given')return 'Divisor '+n+' over '+d+'. Its reciprocal is not shown.';
    if(phase==='reciprocal_only')return 'The reciprocal of the divisor '+n+' over '+d+' is '+d+' over '+n+'.';
    if(phase==='reciprocal')return w+' over one stays unchanged. Dividing by '+n+' over '+d+' becomes multiplication by '+d+' over '+n+'. The product is not shown.';
    if(phase==='multiply')return 'Multiply '+w+' over one by '+d+' over '+n+'. The product is not shown.';
    if(phase==='raw')return 'Numerator product '+w*d+' and denominator product '+n+'. Raw product '+w*d+' over '+n+'.';
    if(phase==='raw_unknown')return 'Find the value of '+w*d+' over '+n+'. The final value is not shown.';
    if(phase==='simplified')return 'The raw product '+w*d+' over '+n+' simplifies to '+format(p)+'.'+(['ribbon','water','flour'].includes(m.object)?' This counts the '+(m.object==='water'?'bottles':m.object==='flour'?'bags':'pieces')+', each '+n+' over '+d+' '+m.unit+'.':'');
    if(phase==='mixed')return format(p)+' equals '+p.n/p.d+' whole groups'+(p.n%p.d?' and '+p.n%p.d+' over '+p.d+' of a group.':'.');
    if(phase==='division')return 'Use '+w+' divided by '+n+' over '+d+' to find the number of pieces. The numerical result is not shown.';
    const original=m.object==='water'?'Water available: '+w+' litres in one container.':m.object==='flour'?'Flour available: '+w+' kilograms.':m.object==='ribbon'||m.object==='cable'?'Original '+m.object+' length: '+w+' metres.':w+' wholes.';
    return original+' Each group has size '+n+' over '+d+(m.unit?' '+m.unit:' of a whole')+'. The number of groups is not shown.';
  }
  window.RevilyProperGroupVisuals={render,accessible,phaseFor,exact};
})();
