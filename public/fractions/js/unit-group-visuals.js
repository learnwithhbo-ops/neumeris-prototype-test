(function () {
  'use strict';
  const esc=value=>window.RevilyVisuals.escapeHtml(String(value));
  const line=(value,klass='')=>'<p class="'+klass+'">'+window.RevilyVisuals.mathMarkup(value)+'</p>';
  function check(m){if(!Number.isSafeInteger(m.wholes)||m.wholes<1||!Number.isSafeInteger(m.denominator)||m.denominator<2)throw new Error('Unit-group models require a positive whole-number amount and a unit-fraction denominator greater than one.');}
  function phaseFor(m,reveal,shown=1,feedback='') {
    if(!reveal)return m.phase||'given';
    if(feedback==='support'&&m.support_phases)return m.support_phases[Math.min(shown-1,m.support_phases.length-1)];
    if(m.resultScope)return m.resultScope;
    const phases=m.working_phases||['group_size','one_whole','count_all','reciprocal'];
    return phases[Math.min(shown-1,phases.length-1)];
  }
  const unit=m=>m.unit==='m'?'metre':m.unit==='kg'?'kilogram':m.unit==='litre'?'litre':'whole';
  const group=m=>m.object==='bottles'?'bottle':m.object==='rice'?'bag':m.object==='ribbon'||m.object==='cable'?'piece':'group';
  function icon(m) {
    if(m.object==='bottles')return '<svg viewBox="0 0 40 50" aria-hidden="true" focusable="false"><path d="M15 3 h10 v10 l7 8 v25 H8 V21 l7 -8 Z" class="os-ug-bottle"/><path d="M15 3 h10 M15 9 h10" class="os-bracket"/></svg>';
    if(m.object==='rice')return '<svg viewBox="0 0 40 50" aria-hidden="true" focusable="false"><path d="M12 5 h16 l-3 8 q16 20 8 32 H7 q-8 -12 8 -32 Z" class="os-ug-bag"/><path d="M13 14 h14" class="os-bracket"/><ellipse cx="17" cy="28" rx="2" ry="4"/><ellipse cx="24" cy="34" rx="2" ry="4"/></svg>';
    return '';
  }
  function sample(m) {
    return '<div class="os-ug-sample">'+line('One '+group(m)+': 1/'+m.denominator+(m.unit?' '+m.unit:''))+'<div class="os-ug-reference"><span class="os-ug-part" style="width:'+100/m.denominator+'%">'+icon(m)+'</span></div>'+line('The full reference width represents one '+unit(m)+'.','os-ug-note')+'</div>';
  }
  function rows(m,count,partition,numbered=false) {
    const n=partition?m.denominator:1;
    let out='<div class="os-ug-wholes">';
    for(let w=0;w<count;w++) {
      out+='<div class="os-ug-row">'+line((m.unit?unit(m)[0].toUpperCase()+unit(m).slice(1):'Whole')+' '+(w+1),'os-ug-row-title')+'<div class="os-ug-whole" style="grid-template-columns:repeat('+n+',minmax(0,1fr))" data-unit-whole="">';
      for(let i=0;i<n;i++)out+='<span class="os-ug-part" data-unit-group="'+partition+'">'+(partition?icon(m):'')+(numbered?'<b>'+(w*m.denominator+i+1)+'</b>':'')+'</span>';
      out+='</div></div>';
    }
    return out+'</div>';
  }
  function description(m) {
    if(m.object==='ribbon')return 'Ribbon length: '+m.wholes+' m';
    if(m.object==='cable')return 'Cable length: '+m.wholes+' m';
    if(m.object==='bottles')return 'Juice in one container: '+m.wholes+' litres';
    if(m.object==='rice')return 'Rice available: '+m.wholes+' kg';
    return 'Original amount: '+m.wholes+' wholes';
  }
  function render(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='unit_groups_rule')return '<div class="os-decision-question"><p>A whole-number amount</p><span>÷</span><p>A unit-fraction group size</p></div>';
    check(m);
    const phase=phaseFor(m,reveal,shown,feedback),w=m.wholes,n=m.denominator,result=w*n;
    let out='<div class="os-unit-groups" data-unit-context="'+esc(m.object)+'" data-unit-phase="'+esc(phase)+'">';
    if(m.show_calculation)out+=line(w+' ÷ 1/'+n,'os-ug-calculation');
    if(phase==='given')out+=line(description(m))+rows(m,w,false)+sample(m)+line('Number of '+group(m)+'s: ?');
    else if(phase==='one_unknown')out+=line('Start with one whole')+rows(m,1,false)+sample(m)+line('How many parts fit?');
    else if(phase==='group_size')out+=sample(m);
    else if(phase==='one_whole')out+=line('Groups in one '+unit(m))+rows(m,1,true,true)+line(n+' groups of size 1/'+n+(m.unit?' '+m.unit:'')+' make one '+unit(m)+'.');
    else if(phase==='count_all')out+=line(description(m))+rows(m,w,true,true)+line(w+' × '+n+' = '+result+' '+group(m)+'s altogether.')+line('Each '+group(m)+' is 1/'+n+(m.unit?' '+m.unit:'')+'.','os-ug-note');
    else if(phase==='missing_multiplier')out+='<div class="os-ug-equation">'+line(w+' × ?')+line('Use the group count for one whole.')+'</div>';
    else if(phase==='multiply')out+='<div class="os-ug-equation">'+line(w+' × '+n+' = ?')+line('Wholes × groups per whole')+'</div>';
    else if(phase==='result'||phase==='stated_result')out+='<div class="os-ug-equation">'+line(w+' ÷ 1/'+n+' = '+result)+(phase==='result'?line('The result counts smaller groups.'):line('Why is this correct?'))+'</div>';
    else if(phase==='reciprocal')out+='<div class="os-ug-equation">'+line('Keep the original amount; change only the divisor.')+line(w+' ÷ 1/'+n)+line('= '+w+'/1 × '+n+'/1')+line('= '+result)+'</div>';
    else if(phase==='division')out+='<div class="os-ug-equation">'+line(w+' ÷ 1/'+n)+line('This calculation finds the number of '+group(m)+'s.')+'</div>';
    else throw new Error('Unknown unit-group visual phase: '+phase);
    return out+'</div>';
  }
  function accessible(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='unit_groups_rule')return 'Choose the method for a whole-number amount divided by a unit-fraction group size.';
    check(m);
    const phase=phaseFor(m,reveal,shown,feedback),w=m.wholes,n=m.denominator,g=group(m),u=m.unit||'whole';
    if(phase==='one_unknown')return 'One whole and a sample part of size one over '+n+'. The number of those parts in one whole is not shown.';
    if(phase==='group_size')return (m.show_calculation?'Calculate '+w+' divided by one over '+n+'. ':'')+'One '+g+' has size one over '+n+' '+u+'. The complete reference width represents one '+unit(m)+'.';
    if(phase==='one_whole')return 'One '+unit(m)+' contains '+n+' '+g+'s, each of size one over '+n+' '+u+'. Only one '+unit(m)+' is being counted.';
    if(phase==='count_all')return w+' '+unit(m)+'s, each containing '+n+' '+g+'s of size one over '+n+' '+u+'. Numbered groups run from one to '+w*n+'. Total '+w*n+' '+g+'s.';
    if(phase==='missing_multiplier')return w+' wholes multiplied by an unknown group count per whole. The multiplier is not shown.';
    if(phase==='multiply')return w+' wholes multiplied by '+n+' groups per whole. The total is not shown.';
    if(phase==='reciprocal')return w+' divided by one over '+n+' equals '+w+' over one multiplied by '+n+' over one, giving '+w*n+'. Only the divisor becomes its reciprocal.';
    if(phase==='result'||phase==='stated_result')return 'Given calculation: '+w+' divided by one over '+n+' equals '+w*n+'.'+(phase==='result'?' The result is a group count.':' Choose why it is correct.');
    if(phase==='division')return 'The required calculation is '+w+' divided by one over '+n+'. Its numerical result is not shown.';
    return (m.show_calculation?'Calculate '+w+' divided by one over '+n+'. ':'')+description(m)+'. Each '+g+' has size one over '+n+' '+u+'. The number of '+g+'s is not shown. Every complete row represents one '+unit(m)+'.';
  }
  window.RevilyUnitGroupVisuals={render,accessible,phaseFor};
})();
