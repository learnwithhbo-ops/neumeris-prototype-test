(function () {
  'use strict';
  const esc=v=>window.RevilyVisuals.escapeHtml(String(v??''));
  const text=(x,y,value,klass='')=>`<text x="${x}" y="${y}" class="${klass}">${esc(value)}</text>`;
  const svg=(content,height)=>`<svg viewBox="0 0 600 ${height}" aria-hidden="true" focusable="false">${content}</svg>`;
  const numerator=f=>f.whole*f.d+f.n;
  const fraction=(x,y,n,d)=>text(x,y-12,n,'os-mixed-number os-middle')+`<path d="M${x-24} ${y} h48" class="os-bracket"/>`+text(x,y+31,d,'os-mixed-number os-middle');
  function numberLabel(x,y,f) {
    if(!f.n)return text(x,y+10,f.whole,'os-mixed-number os-middle');
    return (f.whole?text(x-35,y+10,f.whole,'os-mixed-number os-middle'):'')+fraction(x+(f.whole?15:0),y,f.n,f.d);
  }
  const words=f=>f.n?`${f.whole?f.whole+' and ':''}${f.n} over ${f.d}`:String(f.whole);
  function exactResult(m) {return window.RevilyValidators.parseRational(`${numerator(m.left)*numerator(m.right)}/${m.left.d*m.right.d}`);}
  function parts(f,x,y,split,color='os-water',unitWidth=210) {
    const total=numerator(f),rows=Math.ceil(total/f.d),partial=total%f.d;
    let out='';
    for(let row=0;row<rows;row++) {
      const selected=Math.min(f.d,total-row*f.d),pieces=split||selected<f.d?f.d:1;
      for(let part=0;part<pieces;part++)out+=`<rect x="${x+part*unitWidth/pieces}" y="${y+row*44}" width="${unitWidth/pieces}" height="34" class="${pieces===1||part<selected?color:'os-empty'}" data-mixed-piece="" data-selected="${pieces===1||part<selected}"/>`;
    }
    return {html:out,bottom:y+rows*44,rows,partial};
  }
  function modelPhase(m,reveal,shown=1) {
    if(!reveal)return m.phase||'given';
    if(m.resultScope)return m.resultScope;
    const phases=m.working_phases||['left','right','product','result'];
    return phases[Math.min(shown-1,phases.length-1)];
  }
  function context(m) {
    const {left,right}=m;
    if(m.object==='ribbon') {
      const unit=240,length=numerator(left)/left.d;
      let out=text(38,32,'Reference length: 1 metre');
      out+=`<path d="M50 55 v10 h${unit} v-10" class="os-bracket"/><rect x="50" y="105" width="${unit*length}" height="42" class="os-ribbon-given"/>`;
      for(let i=1;i<length;i++)out+=`<path d="M${50+i*unit} 105 v42" class="os-whole-boundary"/>`;
      out+=text(50,195,'Ribbon length:')+numberLabel(345,186,left)+text(405,198,'m');
      out+=text(50,265,'Fraction used:')+numberLabel(345,255,right);return svg(out,310);
    }
    if(m.object==='panel') {
      const unit=140,length=numerator(left)/left.d,width=numerator(right)/right.d,x=75,y=110;
      let out=text(38,30,'Reference square: 1 m by 1 m');
      out+=`<rect x="${x}" y="${y}" width="${unit}" height="${unit}" class="os-unknown"/><rect x="${x}" y="${y}" width="${length*unit}" height="${width*unit}" class="os-water"/>`;
      for(let i=1;i<length;i++)out+=`<path d="M${x+i*unit} ${y} v${width*unit}" class="os-whole-boundary"/>`;
      for(let i=1;i<width;i++)out+=`<path d="M${x} ${y+i*unit} h${length*unit}" class="os-whole-boundary"/>`;
      out+=text(x,70,'Length')+numberLabel(235,60,left)+text(295,72,'m');
      out+=text(415,140,'Width')+numberLabel(460,195,right)+text(510,207,'m');
      out+=text(38,y+width*unit+55,'Area of the panel: ? m²');return svg(out,y+width*unit+86);
    }
    if(m.object==='flour') {
      let out=text(38,30,'Flour for the dough');
      out+='<path d="M77 73 h100 l-14 24 q50 80 18 146 H73 Q38 170 92 97 Z" class="os-capacity-outline"/><path d="M76 178 h104" class="os-bracket"/>';
      out+=text(225,90,'Flour for one batch:')+numberLabel(375,135,left)+text(440,148,'kg');
      out+=text(225,216,'Number of batches:')+numberLabel(375,261,right);return svg(out,320);
    }
    if(m.object==='machine') {
      let out=text(38,30,'Filling machine');
      out+='<rect x="48" y="68" width="135" height="142" rx="12" class="os-empty"/><path d="M110 110 h118 v50" class="os-bracket"/><path d="M198 183 v85 h65 v-85" class="os-capacity-outline"/>';
      out+=text(290,83,'One cycle fills:')+numberLabel(403,130,left)+text(475,143,'L');
      out+=text(290,229,'Number of cycles:')+numberLabel(403,275,right);return svg(out,326);
    }
    return null;
  }
  function render(m,reveal=false,shown=1) {
    const phase=modelPhase(m,reveal,shown),{left,right}=m;
    if(![left,right].every(f=>f&&[f.whole,f.n,f.d].every(Number.isInteger)&&f.whole>=0&&f.n>=0&&f.d>0&&numerator(f)>0))throw new Error('Mixed-product visual needs explicit positive factors.');
    if(phase==='given'&&m.object!=='symbolic'){const art=context(m);if(!art)throw new Error(`Unknown mixed-product context: ${m.object}`);return art;}
    if(phase==='converted')return svg(text(38,32,'The converted factors')+fraction(180,115,numerator(left),left.d)+text(300,125,'×','os-mixed-number os-middle')+fraction(420,115,numerator(right),right.d),184);
    if(m.focus) {
      const factor=m.focus==='left'?left:right,converted=m.focus==='left'?['left','right','both'].includes(phase):['right','both'].includes(phase);
      let out=text(38,32,m.focus==='left'?'Convert the first complete value':'Convert the second complete value')+numberLabel(300,88,factor);
      const p=parts(factor,195,145,converted,m.focus==='left'?'os-water':'os-mixed-second');out+=p.html;
      if(converted)out+=text(150,p.bottom+38,`${factor.whole} × ${factor.d} + ${factor.n} = ${numerator(factor)}`)+fraction(300,p.bottom+85,numerator(factor),factor.d);
      return svg(out,p.bottom+(converted?138:30));
    }
    if(['product','result','mixed_result'].includes(phase)) {
      const product=exactResult(m),rawN=numerator(left)*numerator(right),rawD=left.d*right.d;
      const resultParts={whole:0,n:Number(product.n),d:Number(product.d)},whole=Number(product.n/product.d),remainder=Number(product.n%product.d);
      const showingRaw=phase==='product';
      let out=text(38,30,showingRaw?'Multiply the complete values':'Keep the exact value; use the requested form');
      const p=parts(showingRaw?{whole:0,n:rawN,d:rawD}:resultParts,195,76,showingRaw,'os-selected');out+=p.html;
      out+=text(38,p.bottom+38,showingRaw?'Exact product:':'Final answer:');
      if(showingRaw)out+=fraction(390,p.bottom+25,rawN,rawD);
      else out+=numberLabel(390,p.bottom+25,{whole,n:remainder,d:Number(product.d)});
      if(m.unit)out+=text(455,p.bottom+38,m.unit);
      return svg(out,p.bottom+88);
    }
    const splitLeft=['left','right','both','converted'].includes(phase),splitRight=['right','both','converted'].includes(phase);
    let out=text(55,32,'First complete value')+text(330,32,'Second complete value');
    out+=numberLabel(155,83,left)+numberLabel(430,83,right);
    const l=parts(left,50,140,splitLeft,'os-water'),r=parts(right,325,140,splitRight,'os-mixed-second');out+=l.html+r.html;
    const bottom=Math.max(l.bottom,r.bottom);
    if(splitLeft){out+=text(55,bottom+36,`${left.whole} × ${left.d} + ${left.n} = ${numerator(left)}`);out+=fraction(155,bottom+80,numerator(left),left.d);}
    if(splitRight){out+=text(330,bottom+36,`${right.whole} × ${right.d} + ${right.n} = ${numerator(right)}`);out+=fraction(430,bottom+80,numerator(right),right.d);}
    return svg(out,bottom+(splitLeft||splitRight?130:30));
  }
  function accessible(m,reveal=false,shown=1) {
    const phase=modelPhase(m,reveal,shown),{left,right}=m;
    if(m.focus){const f=m.focus==='left'?left:right,converted=m.focus==='left'?['left','right','both'].includes(phase):['right','both'].includes(phase);return `${m.focus==='left'?'First':'Second'} complete value ${words(f)}.`+(converted?` Conversion ${numerator(f)} over ${f.d}.`:' The requested conversion numerator is not shown.');}
    const given=m.object==='ribbon'?`Ribbon length ${words(left)} metres; ${words(right)} of it is used.`:m.object==='panel'?`Panel length ${words(left)} metres and width ${words(right)} metres.`:m.object==='flour'?`One dough batch uses ${words(left)} kilograms of flour; the baker makes ${words(right)} batches.`:m.object==='machine'?`One filling cycle delivers ${words(left)} litres; the machine completes ${words(right)} cycles.`:`First factor ${words(left)}; second factor ${words(right)}.`;
    if(phase==='given')return given+' The requested answer is not shown.';
    let description=given;
    if(['left','right','both','converted'].includes(phase))description+=` First conversion ${numerator(left)} over ${left.d}.`;
    if(['right','both','converted'].includes(phase))description+=` Second conversion ${numerator(right)} over ${right.d}.`;
    if(phase==='product')description+=` Exact numerator product ${numerator(left)*numerator(right)}; denominator product ${left.d*right.d}.`;
    if(['result','mixed_result'].includes(phase)){const p=exactResult(m),whole=p.n/p.d,n=p.n%p.d;description+=` Final answer ${n?`${whole?whole+' and ':''}${n} over ${p.d}`:whole}${m.unit?' '+m.unit:''}.`;}
    return description;
  }
  window.RevilyMixedProductVisuals={render,accessible,exactResult,numerator,modelPhase};
})();
