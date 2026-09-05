(function () {
  'use strict';
  const esc=value=>window.RevilyVisuals.escapeHtml(String(value));
  const line=(value,klass='')=>'<p class="'+klass+'">'+window.RevilyVisuals.mathMarkup(value)+'</p>';
  const positive=value=>Number.isSafeInteger(value)&&value>=0;
  function fraction(value) {
    if(!value||!positive(value.n)||!Number.isSafeInteger(value.d)||value.d<1||('whole' in value&&!positive(value.whole)))throw new Error('Mixed-division quantities require non-negative integer parts and a positive denominator.');
    if(value.n>=value.d&&'whole' in value)throw new Error('The fractional part of a mixed number must be proper.');
    return {n:BigInt(('whole' in value?value.whole:0)*value.d+value.n),d:BigInt(value.d)};
  }
  const format=value=>'whole' in value?value.whole+' '+value.n+'/'+value.d:value.n+'/'+value.d;
  const exactText=value=>value.d===1n?String(value.n):value.n+'/'+value.d;
  const spokenExact=value=>value.d===1n?String(value.n):value.n+' over '+value.d;
  function exactResult(m) {
    const left=fraction(m.left),right=fraction(m.right);
    if(right.n===0n)throw new Error('A mixed-division divisor cannot be zero.');
    return window.RevilyValidators.parseRational({n:left.n*right.d,d:left.d*right.n});
  }
  function phaseFor(m,reveal,shown=1,feedback='') {
    if(!reveal)return m.phase||'given';
    if(feedback==='support'&&m.support_phases)return m.support_phases[Math.min(shown-1,m.support_phases.length-1)];
    if(m.resultScope)return m.resultScope;
    const phases=m.working_phases||['left_converted','right_converted','reciprocal','raw','simplified'];
    return phases[Math.min(shown-1,phases.length-1)];
  }
  function mixedBars(value,labelText,kind='amount') {
    const whole='whole' in value?value.whole:0,rows=[];
    for(let index=0;index<whole;index++)rows.push('<div class="os-mdv-bar is-full" data-mixed-whole=""><span></span></div>');
    if(value.n)rows.push('<div class="os-mdv-bar is-part" data-mixed-part=""><span style="width:'+100*value.n/value.d+'%"></span><i style="grid-template-columns:repeat('+value.d+',minmax(0,1fr))">'+Array.from({length:value.d},()=>'<b></b>').join('')+'</i></div>');
    return '<section class="os-mdv-mixed-bars" data-mixed-kind="'+esc(kind)+'">'+line(labelText+': '+format(value))+rows.join('')+'</section>';
  }
  function meaning(m,phase) {
    if(phase==='small_parts'||phase==='grouped') {
      const left=fraction(m.left),right=fraction(m.right),groupModel={kind:'fraction_groups',a:Number(left.n),b:Number(left.d),c:Number(right.n),d:Number(right.d),object:'bars',phase:phase==='small_parts'?'equivalent':'grouped'};
      return window.RevilyFractionGroupVisuals.render(groupModel,false);
    }
    return '<div class="os-mdv-meaning">'+mixedBars(m.left,'Starting amount')+mixedBars(m.right,'Size of one group','group')+line('Number of groups: ?','os-mdv-question')+'</div>';
  }
  function lengthContext(m,solved) {
    const name=m.object==='plank'?'plank':'ribbon',piece=m.object==='plank'?'piece':'length',result=exactResult(m),count=result.d===1n?Number(result.n):0;
    let out=line((m.object==='plank'?'Original plank: ':'Ribbon available: ')+format(m.left)+' '+(m.unit||'m'));
    out+='<div class="os-mdv-length" data-length-kind="'+name+'">'+Array.from({length:Math.max(1,m.left.whole||1)},(_,i)=>'<span class="is-whole">'+(i+1)+'</span>').join('')+(m.left.n?'<span class="is-part" style="flex:'+m.left.n/m.left.d+' 1 0"></span>':'')+'</div>';
    out+=line('One '+piece+': '+format(m.right)+' '+(m.unit||'m'))+'<div class="os-mdv-piece" data-length-kind="'+name+'"><span style="width:'+100*Number(fraction(m.right).n)/Number(fraction(m.right).d)+'%"></span></div>';
    if(solved&&count)out+='<div class="os-mdv-cut-pieces">'+Array.from({length:count},(_,i)=>'<span>'+(i+1)+'</span>').join('')+'</div>';
    return out+line('Number of '+(m.object==='plank'?'pieces':'complete lengths')+': '+(solved&&count?count:'?'));
  }
  function vessel(kind,labelText) {
    return '<figure class="os-mdv-vessel" data-vessel="'+kind+'"><div><span></span></div>'+line(labelText)+'</figure>';
  }
  function liquidContext(m,solved) {
    const paint=m.object==='paint',result=exactResult(m),count=result.d===1n?Number(result.n):0,name=paint?'tin':'jar';
    let out=line((paint?'Paint available: ':'Juice available: ')+format(m.left)+' '+(m.unit||'litres'))+'<div class="os-mdv-vessels">'+vessel(paint?'paint-can':'jug',paint?'Paint can':'Juice container')+vessel(paint?'paint-tin':'jar','One '+name+': '+format(m.right)+' '+(m.unit||'litres'))+'</div>';
    if(solved&&!paint&&count)out+='<div class="os-mdv-vessels is-result">'+Array.from({length:count},(_,i)=>vessel('jar','Jar '+(i+1))).join('')+'</div>';
    return out+line('Number of '+name+'s: '+(solved&&count?count:'?'));
  }
  function context(m,solved=false) {
    return '<div class="os-mdv-context">'+(['ribbon','plank'].includes(m.object)?lengthContext(m,solved):liquidContext(m,solved))+'</div>';
  }
  function method(m,phase) {
    const left=fraction(m.left),right=fraction(m.right),result=exactResult(m),leftText=exactText(left),rightText=exactText(right),reciprocal=right.d+'/'+right.n,raw=left.n*right.d+'/'+String(left.d*right.n);
    if(phase==='left_conversion_unknown')return line(format(m.left)+' = ?')+line('Convert the starting mixed number first.');
    if(phase==='left_converted')return line(format(m.left)+' = '+leftText)+line(format(m.right)+' remains the divisor.');
    if(phase==='right_converted')return line(format(m.right)+' = '+rightText)+line('Both quantities are now fractions.');
    if(phase==='converted')return line(leftText+' ÷ '+rightText)+line('The converted values are unchanged quantities.');
    if(phase==='right_reciprocal_unknown')return line('Divisor: '+rightText)+line('Reciprocal: ?');
    if(phase==='reciprocal')return line('Keep the first fraction; reciprocate only the divisor.')+line(leftText+' ÷ '+rightText+' = '+leftText+' × '+reciprocal);
    if(phase==='raw_unknown')return line(leftText+' × '+reciprocal+' = ?')+line('Enter the numerator and denominator products.');
    if(phase==='raw')return line(left.n+' × '+right.d+' = '+left.n*right.d)+line(left.d+' × '+right.n+' = '+left.d*right.n)+line('Product: '+raw);
    if(phase==='simplified')return line(raw+' = '+exactText(result))+line('This is the simplest exact quotient.');
    if(phase==='mixed_result')return line(exactText(result)+' = '+(result.n/result.d)+(result.n%result.d?' '+result.n%result.d+'/'+result.d:''))+line('The improper fraction and mixed number are equivalent.');
    if(phase==='stated_result')return line(format(m.left)+' ÷ '+format(m.right)+' = '+exactText(result))+line('Why is this valid?');
    return line(format(m.left)+' ÷ '+format(m.right))+line('Convert every mixed number before using the reciprocal.');
  }
  function render(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='mixed_division_rule')return '<div class="os-decision-question"><p>Mixed-number division</p><span>↓</span><p>Convert, keep the first value, then reciprocate only the divisor</p></div>';
    fraction(m.left);fraction(m.right);exactResult(m);
    const phase=phaseFor(m,reveal,shown,feedback),contextual=['ribbon','plank','juice','paint'].includes(m.object);
    let art;
    if(['reference_mixed','small_parts','grouped'].includes(phase))art=meaning(m,phase);
    else if(contextual&&(phase==='given'||phase==='context_result'))art=context(m,phase==='context_result');
    else if(contextual&&phase==='division')art=context(m,false)+method(m,'converted');
    else art=method(m,phase);
    return '<div class="os-mixed-division" data-mixed-division-phase="'+esc(phase)+'" data-mixed-division-context="'+esc(m.object||'symbolic')+'">'+art+'</div>';
  }
  function accessible(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='mixed_division_rule')return 'Choose the valid method for dividing with mixed numbers.';
    const left=fraction(m.left),right=fraction(m.right),result=exactResult(m),phase=phaseFor(m,reveal,shown,feedback),leftMixed=format(m.left),rightMixed=format(m.right),leftExact=exactText(left),rightExact=exactText(right);
    if(phase==='reference_mixed')return 'Starting amount '+leftMixed+'. One group has size '+rightMixed+'. Each full bar represents one whole. The number of groups is not shown.';
    if(phase==='small_parts'||phase==='grouped')return window.RevilyFractionGroupVisuals.accessible({kind:'fraction_groups',a:Number(left.n),b:Number(left.d),c:Number(right.n),d:Number(right.d),object:'bars',phase:phase==='small_parts'?'equivalent':'grouped'},false);
    if(phase==='left_conversion_unknown')return 'Convert '+leftMixed+' to an improper fraction. The numerator is not shown.';
    if(phase==='left_converted')return leftMixed+' equals '+spokenExact(left)+'. The divisor remains '+rightMixed+'.';
    if(phase==='right_converted')return rightMixed+' equals '+spokenExact(right)+'. Both quantities are now written as fractions.';
    if(phase==='converted')return 'The equivalent fraction division is '+spokenExact(left)+' divided by '+spokenExact(right)+'. The quotient is not shown.';
    if(phase==='right_reciprocal_unknown')return 'The divisor is '+spokenExact(right)+'. Its reciprocal is not shown.';
    if(phase==='reciprocal')return 'Keep '+spokenExact(left)+' and replace division by '+spokenExact(right)+' with multiplication by the divisor’s reciprocal, '+right.d+' over '+right.n+'.';
    if(phase==='raw_unknown')return 'Multiply '+spokenExact(left)+' by '+right.d+' over '+right.n+'. The numerator and denominator products are not shown.';
    if(phase==='raw')return 'The raw product is '+left.n*right.d+' over '+left.d*right.n+'.';
    if(phase==='simplified'||phase==='mixed_result')return 'The exact quotient is '+spokenExact(result)+(phase==='mixed_result'?' and its equivalent mixed-number form is shown.':'.');
    if(phase==='stated_result')return 'Given: '+leftMixed+' divided by '+rightMixed+' equals '+spokenExact(result)+'. Choose why the method is valid.';
    if(['ribbon','plank','juice','paint'].includes(m.object)) {
      const object=m.object==='ribbon'?'ribbon':m.object==='plank'?'plank':m.object==='juice'?'juice':'paint',group=m.object==='ribbon'?'length':m.object==='plank'?'piece':m.object==='juice'?'jar':'tin';
      if(phase==='context_result')return object+' amount '+leftMixed+' '+(m.unit||'')+' makes '+exactText(result)+' complete '+group+'s of size '+rightMixed+' '+(m.unit||'')+'.';
      if(phase==='division')return object+' amount '+leftMixed+' '+(m.unit||'')+' and one '+group+' of size '+rightMixed+' '+(m.unit||'')+'. The displayed division compares the available amount with one group size; its answer is not shown.';
      return object+' amount '+leftMixed+' '+(m.unit||'')+'. One '+group+' has size '+rightMixed+' '+(m.unit||'')+'. The number of '+group+'s is not shown.';
    }
    return 'Starting amount '+leftMixed+' and divisor '+rightMixed+'. Convert every mixed number before dividing. The quotient is not shown.';
  }
  window.RevilyMixedDivisionVisuals={render,accessible,phaseFor,exactResult,fraction};
})();
