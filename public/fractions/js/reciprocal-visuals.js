(function () {
  'use strict';
  const esc = value => window.RevilyVisuals.escapeHtml(String(value));
  const text = (x,y,value,klass='') => '<text x="'+x+'" y="'+y+'" class="'+klass+'">'+esc(value)+'</text>';
  const svg = (content,height=300) => '<svg viewBox="0 0 600 '+height+'" aria-hidden="true" focusable="false">'+content+'</svg>';
  function fraction(x,y,n,d,colours) {
    let out='';
    if(colours) out+='<rect x="'+(x-38)+'" y="'+(y-50)+'" width="76" height="44" rx="8" class="'+colours[0]+'"/><rect x="'+(x-38)+'" y="'+(y+6)+'" width="76" height="44" rx="8" class="'+colours[1]+'"/>';
    return out+text(x,y-16,n,'os-recip-number os-middle')+'<path d="M'+(x-42)+' '+y+' h84" class="os-bracket"/>'+text(x,y+38,d,'os-recip-number os-middle');
  }
  const value = (x,y,n,d) => d===1?text(x,y+9,n,'os-recip-number os-middle'):fraction(x,y,n,d);
  function phaseFor(m,reveal,shown=1,feedback='') {
    if(!reveal) return m.phase||'given';
    if(feedback==='support'&&m.support_phases)return m.support_phases[Math.min(shown-1,m.support_phases.length-1)];
    if(m.resultScope) return m.resultScope;
    const phases=m.working_phases||(m.whole?['as_fraction','exchange','check']:['identify','exchange','check']);
    return phases[Math.min(shown-1,phases.length-1)];
  }
  function arrows() {
    return '<path d="M197 122 C275 70 325 223 400 174" class="os-recip-down"/><path d="M387 173 l15 1 -8 12" class="os-recip-down"/><path d="M197 174 C275 227 325 73 400 122" class="os-recip-up"/><path d="M387 121 l15 1 -8 12" class="os-recip-up"/>'+text(300,70,'moves down','os-middle')+text(300,240,'moves up','os-middle');
  }
  function render(m,reveal=false,shown=1,feedback='') {
    const phase=phaseFor(m,reveal,shown,feedback);
    if(m.kind==='reciprocal_rule') return '<div class="os-decision-question"><p>A number and its reciprocal</p><span>↓</span><p>How are they related?</p></div>';
    if(m.kind==='reciprocal_zero') {
      if(m.phase==='undefined') return svg(text(300,35,'A denominator cannot be zero','os-middle')+fraction(300,125,1,0)+text(300,222,'Undefined — not a number','os-middle'),260);
      return svg(text(300,35,'Multiplication by zero','os-middle')+text(300,120,'0 × any number = 0','os-recip-number os-middle')+text(300,196,'It cannot give 1','os-middle'),240);
    }
    if(!Number.isInteger(m.n)||!Number.isInteger(m.d)||m.n<=0||m.d<=0||m.whole&&m.d!==1) throw new Error('Reciprocal models require explicit positive integer parts.');
    if(phase==='definition')return svg(text(300,55,'A number × its reciprocal','os-middle')+text(300,130,'= 1','os-recip-number os-middle')+text(300,205,'A multiplicative relationship','os-middle'),245);
    if(phase==='inverse_name') return svg(text(300,65,'Multiplicative inverse','os-middle')+text(300,125,'means','os-middle')+text(300,190,'Reciprocal','os-recip-number os-middle'),235);
    if(m.object==='machine'&&['given','exchange'].includes(phase)) {
      let out=text(155,32,'First multiplier','os-middle')+text(445,32,'Second multiplier','os-middle');
      out+='<rect x="55" y="65" width="200" height="152" rx="14" class="os-empty"/><rect x="345" y="65" width="200" height="152" rx="14" class="os-unknown"/>';
      out+=text(95,150,'×','os-recip-number')+fraction(175,140,m.n,m.d);
      out+=text(385,150,'×','os-recip-number')+(phase==='exchange'?fraction(465,140,m.d,m.n):text(465,150,'?','os-recip-number os-middle'));
      out+='<path d="M268 140 h62 l-10 -8 m10 8 -10 8" class="os-bracket"/>';
      out+=text(155,260,'Changes the input','os-middle')+text(445,260,'Restores the input','os-middle');
      return svg(out,300);
    }
    if(m.object==='missing_factor'&&phase==='given') return svg(text(300,35,'Find the missing number','os-middle')+text(70,150,'?','os-recip-number os-middle')+text(170,150,'×','os-recip-number os-middle')+value(290,140,m.n,m.d)+text(420,150,'=','os-recip-number os-middle')+text(510,150,'1','os-recip-number os-middle'),230);
    if(phase==='pair') return svg(text(300,35,'The two given numbers','os-middle')+value(155,140,m.n,m.d)+text(300,150,'and','os-middle')+value(445,140,m.d,m.n),230);
    if(phase==='check') {
      const product=String(BigInt(m.n)*BigInt(m.d));
      return svg(text(300,32,'Check by multiplication','os-middle')+value(80,130,m.n,m.d)+text(180,140,'×','os-recip-number os-middle')+value(280,130,m.d,m.n)+text(380,140,'=','os-recip-number os-middle')+fraction(480,130,product,product)+text(300,240,'The product is 1','os-recip-number os-middle'),282);
    }
    if(phase==='as_fraction') return svg(text(300,35,'Same whole-number value','os-middle')+text(170,140,m.n,'os-recip-number os-middle')+text(290,140,'=','os-recip-number os-middle')+fraction(420,130,m.n,1,['os-water','os-mixed-second']),230);
    if(phase==='exchange') {
      let out=text(155,35,'Original fraction','os-middle')+text(445,35,'Reciprocal','os-middle')+fraction(155,150,m.n,m.d,['os-water','os-mixed-second'])+fraction(445,150,m.d,m.n,['os-mixed-second','os-water'])+arrows();
      if(m.n===1) out+=text(445,287,'= '+m.d,'os-recip-number os-middle');
      const compact=text(150,30,'Original fraction','os-middle')+fraction(150,95,m.n,m.d,['os-water','os-mixed-second'])+text(150,230,'Reciprocal','os-middle')+fraction(150,295,m.d,m.n,['os-mixed-second','os-water'])+'<path d="M106 79 C20 105 20 303 105 333 m-13 -12 13 12 -17 2" class="os-recip-down"/><path d="M194 133 C276 165 276 247 195 279 m16 -1 -16 1 10 -13" class="os-recip-up"/>'+(m.n===1?text(150,385,'= '+m.d,'os-recip-number os-middle'):'');
      return '<div class="os-recip-wide">'+svg(out,m.n===1?325:285)+'</div><div class="os-recip-narrow"><svg viewBox="0 0 300 '+(m.n===1?410:355)+'" aria-hidden="true" focusable="false">'+compact+'</svg></div>';
    }
    let out=text(300,35,m.whole?'Original whole number':'Original fraction','os-middle')+value(300,140,m.n,m.d);
    if(phase==='identify') out+=text(300,232,'Numerator '+m.n+'; denominator '+m.d,'os-middle');
    else out+=text(300,232,m.task==='as_fraction'?'Same value as a fraction: ?':m.task==='inverse'?'Multiplicative inverse: ?':'Reciprocal: ?','os-middle');
    return svg(out,275);
  }
  function accessible(m,reveal=false,shown=1,feedback='') {
    if(m.kind==='reciprocal_rule') return 'Consider the relationship between a number and its reciprocal.';
    if(m.kind==='reciprocal_zero') return m.phase==='undefined'?'One over zero is undefined; it is not a valid reciprocal.':'Zero multiplied by any number gives zero, never one.';
    const phase=phaseFor(m,reveal,shown,feedback),given=m.whole?String(m.n):m.n+' over '+m.d,reciprocal=m.n===1?String(m.d):m.d+' over '+m.n;
    if(phase==='definition')return 'A non-zero number multiplied by its reciprocal equals one; this is a multiplicative relationship.';
    if(m.object==='machine'&&phase==='given') return 'The first machine multiplies the input by '+given+'. Find the second multiplier that restores the original input. Its value is not shown.';
    if(m.object==='machine'&&phase==='exchange') return 'First multiplier '+given+'; second multiplier '+reciprocal+'. Together the two multipliers restore the original input.';
    if(phase==='inverse_name') return 'Multiplicative inverse is another name for reciprocal.';
    if(m.object==='missing_factor'&&phase==='given') return 'An unknown number multiplied by '+given+' gives one. The unknown number is not shown.';
    if(phase==='pair') return 'Two given numbers: '+given+' and '+reciprocal+'. Their relationship is not stated.';
    if(phase==='as_fraction') return 'The whole number '+m.n+' written as '+m.n+' over one. Its value is unchanged; its reciprocal is not yet shown.';
    if(phase==='exchange') return 'Original fraction '+m.n+' over '+m.d+'. The numerator '+m.n+' moves to the denominator; the denominator '+m.d+' moves to the numerator. Reciprocal '+reciprocal+'.';
    if(phase==='check') return given+' multiplied by '+reciprocal+' gives '+(BigInt(m.n)*BigInt(m.d))+' over '+(BigInt(m.n)*BigInt(m.d))+', which is one.';
    return 'Original number '+given+'.'+(phase==='identify'?' Numerator '+m.n+'; denominator '+m.d+'.':'')+(m.task==='as_fraction'?' Its fraction form is not shown.':m.task==='inverse'?' Its multiplicative inverse is not shown.':' The reciprocal is not shown.');
  }
  window.RevilyReciprocalVisuals={render,accessible,phaseFor};
})();
