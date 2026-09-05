(function () {
  'use strict';
  const esc=value=>window.RevilyVisuals.escapeHtml(String(value));
  const line=(value,klass='')=>'<p class="'+klass+'">'+window.RevilyVisuals.mathMarkup(value)+'</p>';
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  const format=p=>p.d===1n?String(p.n):p.n+'/'+p.d;
  function exact(m) {
    if(![m.a,m.b,m.c,m.d].every(n=>Number.isSafeInteger(n)&&n>0))throw new Error('Fraction grouping needs four positive integer fraction parts.');
    return window.RevilyValidators.parseRational({n:BigInt(m.a)*BigInt(m.d),d:BigInt(m.b)*BigInt(m.c)});
  }
  function phaseFor(m,reveal,shown=1,feedback='') {
    if(!reveal)return m.phase||'given';
    if(feedback==='support'&&m.support_phases)return m.support_phases[Math.min(shown-1,m.support_phases.length-1)];
    if(m.resultScope)return m.resultScope;
    const phases=m.working_phases||['keep','reciprocal','raw','simplified'];
    return phases[Math.min(shown-1,phases.length-1)];
  }
  function partition(m,phase) {
    const denominator=phase==='original'?m.b:m.b*m.d/gcd(m.b,m.d),selected=m.a*denominator/m.b,perGroup=m.c*denominator/m.d,grouped=phase==='grouped';
    let out=line('Every full reference bar represents one whole.','os-fg-note');
    for(let row=0;row<Math.ceil(m.a/m.b);row++) {
      const offset=row*denominator,used=Math.min(denominator,selected-offset);
      out+='<div class="os-fg-reference" style="grid-template-columns:repeat('+denominator+',minmax(0,1fr))">';
      for(let i=0;i<denominator;i++) {
        const index=offset+i,shaded=i<used,group=shaded?Math.floor(index/perGroup):-1,end=grouped&&shaded&&((index+1)%perGroup===0||index+1===selected);
        out+='<span data-fraction-part="'+(shaded?'selected':'empty')+'"'+(grouped&&shaded?' data-fraction-group="'+group+'"':'')+' class="'+(shaded?grouped&&group%2?'os-fg-gold':'os-fg-blue':'os-fg-empty')+(end?' os-fg-group-end':'')+'"></span>';
      }
      out+='</div>';
      if(grouped) {
        out+='<div class="os-fg-brackets">';
        for(let i=0;i<used;) {
          const index=offset+i,remaining=perGroup-index%perGroup,length=Math.min(remaining,used-i);
          out+='<span style="width:'+100*length/denominator+'%">'+(index%perGroup?'continues':'Group '+(Math.floor(index/perGroup)+1))+'</span>';i+=length;
        }
        out+='</div>';
      }
    }
    out+=line('Shaded amount: '+(phase==='original'?m.a+'/'+m.b:selected+'/'+denominator));
    if(grouped)out+=line('Each complete group: '+m.c+'/'+m.d)+line('Group count: '+format(exact(m)));
    else if(phase==='equivalent')out+=line(m.a+'/'+m.b+' = '+selected+'/'+denominator);
    else out+=line('Size of one group: '+m.c+'/'+m.d);
    return out;
  }
  function vessel(kind) {
    if(kind==='jug')return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M18 15 H72 V97 H18 Z" class="os-fg-juice"/><path d="M18 8 V100 H72 V8 M72 27 Q103 27 90 67 H72" class="os-fg-outline"/></svg>';
    if(kind==='cup')return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M20 35 H72 L65 95 H27 Z" class="os-fg-juice"/><path d="M72 45 Q95 38 92 65 Q90 78 68 74" class="os-fg-outline"/></svg>';
    if(kind==='bag')return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M25 10 H75 L64 30 Q98 65 84 100 H16 Q2 65 36 30 Z" class="os-fg-rice"/><path d="M33 30 H67" class="os-fg-outline"/></svg>';
    if(kind==='portion')return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M12 66 Q50 29 88 66 Z" class="os-fg-rice"/><path d="M10 67 H90 Q87 100 50 100 Q13 100 10 67 Z" class="os-fg-bowl"/></svg>';
    if(kind==='paint')return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M18 23 H82 V100 H18 Z" class="os-fg-paint"/><path d="M18 28 Q50 -10 82 28" class="os-fg-outline"/></svg>';
    return '<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><path d="M40 8 H60 V29 L75 44 V100 H25 V44 L40 29 Z" class="os-fg-paint"/></svg>';
  }
  function context(m,solved=false) {
    const p=exact(m),count=Number(p.n/p.d);
    if(solved&&p.d!==1n)throw new Error('Complete cups, portions and pieces need an exact integer count.');
    if(m.object==='wire') {
      let out=line((solved?'Cut wire: ':'Original wire: ')+m.a+'/'+m.b+' m')+'<div class="os-fg-wire-reference"><div class="os-fg-wire" style="width:'+100*m.a/m.b+'%">';
      for(let i=0;i<(solved?count:1);i++)out+='<span'+(solved?' data-fraction-piece=""':'')+'></span>';
      out+='</div></div>'+line('One piece: '+m.c+'/'+m.d+' m')+'<div class="os-fg-wire-reference"><div class="os-fg-wire" style="width:'+100*m.c/m.d+'%"><span></span></div></div>';
      return out+line('Both full reference widths represent one metre.','os-fg-note')+line('Number of pieces: '+(solved?count:'?'));
    }
    const rice=m.object==='rice',paint=m.object==='paint',name=rice?'portion':paint?'bottle':'cup',unit=rice?'kg':'litre',original=rice?'bag':paint?'paint':'jug';
    let out=line((rice?'Rice available: ':paint?'Paint available: ':'Juice available: ')+m.a+'/'+m.b+' '+unit);
    if(!solved)out+='<div class="os-fg-objects"><figure>'+vessel(original)+line('Original '+(rice?'bag':paint?'container':'jug'))+'</figure><figure>'+vessel(name)+line('One '+name+': '+m.c+'/'+m.d+' '+unit)+'</figure></div>'+line('Number of '+name+'s: ?');
    else out+=line('Made into '+count+' '+name+'s')+'<div class="os-fg-objects">'+Array.from({length:count},(_,i)=>'<figure data-fraction-recipient="">'+vessel(name)+line(name[0].toUpperCase()+name.slice(1)+' '+(i+1))+line(m.c+'/'+m.d+' '+unit)+'</figure>').join('')+'</div>';
    return out;
  }
  function render(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='fraction_groups_rule')return '<div class="os-decision-question"><p>A fractional amount</p><span>÷</span><p>A fractional group size</p></div>';
    const p=exact(m),phase=phaseFor(m,reveal,shown,feedback),first=m.a+'/'+m.b,second=m.c+'/'+m.d,recip=m.d+'/'+m.c,raw=m.a*m.d+'/'+(m.b*m.c),contextual=['juice','rice','wire','paint'].includes(m.object);
    let out='<div class="os-fraction-groups" data-fraction-phase="'+esc(phase)+'" data-fraction-context="'+esc(m.object)+'">';
    if(phase==='given')out+=contextual?context(m):line(first+' ÷ '+second)+line('Starting amount: '+first)+line('Size of one group: '+second)+line('Number of groups: ?');
    else if(['original','equivalent','grouped'].includes(phase))out+=partition(m,phase);
    else if(phase==='stated_result')out+=line(first+' ÷ '+second+' = '+format(p))+line('Why is this correct?');
    else if(phase==='keep')out+=line(first+' ÷ '+second)+line('Keep the starting amount: '+first);
    else if(phase==='divisor_given')out+=line('Divisor: '+second)+line('Reciprocal: ?');
    else if(phase==='reciprocal_only')out+=line('Divisor: '+second)+line('Reciprocal: '+recip);
    else if(phase==='missing_multiplier')out+=line(first+' ÷ '+second)+line('= '+first+' × ?');
    else if(phase==='reciprocal')out+=line('Only the second fraction changes.')+line(first+' ÷ '+second)+line('= '+first+' × '+recip);
    else if(phase==='multiply')out+=line(first+' × '+recip+' = ?');
    else if(phase==='raw')out+=line(m.a+' × '+m.d+' = '+m.a*m.d)+line(m.b+' × '+m.c+' = '+m.b*m.c)+line('Product: '+raw);
    else if(phase==='raw_unknown')out+=line(raw+' = ?')+line('Give the simplest exact value.');
    else if(phase==='simplified')out+=line(raw===format(p)?raw+' is already in simplest form.':raw+' = '+format(p))+(contextual?context(m,true):line('The divisor is '+(m.c<m.d?'below one, so the result is larger than':m.c>m.d?'above one, so the result is smaller than':'one, so the result equals')+' the starting amount.','os-fg-note'));
    else if(phase==='mixed')out+=line(format(p)+' = '+(p.n%p.d?p.n/p.d+' '+p.n%p.d+'/'+p.d:p.n/p.d))+line('The same exact count in another form.');
    else if(phase==='division')out+=line(first+' ÷ '+second)+line('This calculation finds the number of bottles.');
    else throw new Error('Unknown fraction-group phase: '+phase);
    return out+'</div>';
  }
  function accessible(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='fraction_groups_rule')return 'Choose a valid method for dividing one fraction by another.';
    const p=exact(m),phase=phaseFor(m,reveal,shown,feedback),first=m.a+' over '+m.b,second=m.c+' over '+m.d,common=m.b*m.d/gcd(m.b,m.d),selected=m.a*common/m.b;
    if(phase==='original')return 'The shaded amount is '+first+'. Every full bar represents one whole. The group size is '+second+'. The number of groups is not shown.';
    if(phase==='equivalent')return 'The same '+first+' is repartitioned into '+selected+' parts of size one over '+common+'. The total shaded width is unchanged.';
    if(phase==='grouped')return selected+' parts of size one over '+common+' form '+format(p)+' groups of size '+second+'. The reference whole and shaded amount are unchanged.';
    if(phase==='stated_result')return 'Given: '+first+' divided by '+second+' equals '+format(p)+'. Choose the explanation.';
    if(phase==='keep')return 'Keep the starting fraction '+first+' unchanged. The divisor is '+second+'.';
    if(phase==='divisor_given')return 'Divisor: '+second+'. Its reciprocal is not shown.';
    if(phase==='reciprocal_only')return 'The reciprocal of '+second+' is '+m.d+' over '+m.c+'.';
    if(phase==='missing_multiplier')return first+' divided by '+second+' equals '+first+' multiplied by an unknown number. The multiplier is not shown.';
    if(phase==='reciprocal')return 'Keep '+first+' and replace division by '+second+' with multiplication by '+m.d+' over '+m.c+'. The result is not shown.';
    if(phase==='multiply')return 'Multiply '+first+' by '+m.d+' over '+m.c+'. The product is not shown.';
    if(phase==='raw')return 'Numerator product '+m.a*m.d+'; denominator product '+m.b*m.c+'. Raw fraction '+m.a*m.d+' over '+m.b*m.c+'.';
    if(phase==='raw_unknown')return 'Simplify '+m.a*m.d+' over '+m.b*m.c+'. The simplest value is not shown.';
    if(phase==='simplified')return 'The product simplifies to '+format(p)+'. The divisor is '+(m.c<m.d?'below one and the result is larger than':m.c>m.d?'above one and the result is smaller than':'one and the result equals')+' the starting amount.'+(m.object==='juice'?' The result counts cups.':m.object==='rice'?' The result counts portions.':m.object==='wire'?' The result counts pieces.':'');
    if(phase==='mixed')return format(p)+' equals '+p.n/p.d+(p.n/p.d===1n?' whole':' wholes')+(p.n%p.d?' and '+p.n%p.d+' over '+p.d:'')+'.';
    if(phase==='division')return 'The required calculation is '+first+' divided by '+second+'. Its numerical answer is not shown.';
    const given=m.object==='juice'?'Juice in a jug':m.object==='rice'?'Rice in a bag':m.object==='wire'?'Wire length':m.object==='paint'?'Paint in a container':'Starting amount';
    return given+': '+first+(m.unit?' '+m.unit:'')+'. One '+(m.object==='juice'?'cup':m.object==='rice'?'portion':m.object==='wire'?'piece':m.object==='paint'?'bottle':'group')+' has size '+second+(m.unit?' '+m.unit:'')+'. The group count is not shown.';
  }
  window.RevilyFractionGroupVisuals={render,accessible,phaseFor,exact};
})();
