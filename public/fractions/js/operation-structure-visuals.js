(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const number = value => {
    const p = window.RevilyValidators.parseRational(value);
    if (!p) throw new Error(`Invalid authored quantity: ${value}`);
    return Number(p.n) / Number(p.d);
  };
  const modelFor = (visual, ctx) => visual?.model || visual?.scene?.model || ctx.question?.visual?.model;
  const disclosed = (m, ctx) => m.solved === true || (ctx.question?.reveal_model_on_submit !== false && ['correct','support','worked'].includes(ctx.feedback));
  const gcdInt = (a,b) => { let x=Math.abs(a),y=Math.abs(b); while(y)[x,y]=[y,x%y]; return x||1; };
  function resultFor(m) {
    if(['mixed_subtract_no_exchange','mixed_subtract_exchange'].includes(m.kind)){const v=window.RevilyMixedSubtraction.values(m);return v.whole+v.n/v.d;}
    if(['mixed_add_no_regroup','mixed_add_regroup'].includes(m.kind)){const v=window.RevilyMixedAddition.values(m);return v.finalWhole+v.n/v.d;}
    if(m.kind==='mixed_conversion'){const v=window.RevilyMixedConversion.values(m);return v.total/v.d;}
    if(m.kind==='simplify_after_operation'){const v=window.RevilySimplifyOperationVisuals.quantities(m);return v.n/v.d;}
    if(m.kind==='lowest_common_denominator')return m.a*m.b/gcdInt(m.a,m.b);
    if(['one_multiple_subtract','both_denominators_subtract'].includes(m.kind))return m.a/m.b-m.c/m.d;
    if(['one_multiple_add','both_denominators_add'].includes(m.kind))return m.a/m.b+m.c/m.d;
    if(m.kind==='equivalent_fraction')return m.target_n/m.target_d;
    if(m.kind==='simplify_fraction'){const g=gcdInt(m.n,m.d);return (m.n/g)/(m.d/g);}
    if(m.kind==='same_denominator_subtract')return (m.a-m.b)/m.d;
    if(m.kind==='same_denominator_add')return (m.a+m.b)/m.d;
    if(m.kind==='fraction_groups')return m.a*m.d/(m.b*m.c);
    if(m.kind==='proper_groups')return m.wholes*m.d/m.n;
    if(m.kind==='unit_groups')return m.wholes*m.denominator;
    if(m.kind==='fraction_share')return m.n/(m.d*m.divisor);
    if(m.kind==='reciprocal')return m.d/m.n;
    if(m.kind==='mixed_product'){const p=window.RevilyMixedProductVisuals.exactResult(m);return Number(p.n)/Number(p.d);}
    if(m.kind==='mixed_division'){const p=window.RevilyMixedDivisionVisuals.exactResult(m);return Number(p.n)/Number(p.d);}
    if(m.kind==='multi_step'){const p=window.RevilyMultiStepVisuals.exactResult(m);return Number((m.answer_scope==='intermediate'?p.intermediate:p.result).n)/Number((m.answer_scope==='intermediate'?p.intermediate:p.result).d);}
    if(['fraction_product','simplify_product','cancel_product'].includes(m.kind))return m.a*m.c/(m.b*m.d);
    if(m.kind==='whole_multiple')return m.n*m.copies/m.d;
    if(m.resultScope==='unit') return m.kind==='rebuild_amount'?number(m.known)/m.n:number(m.total)/m.d;
    if(m.kind==='rebuild_amount') return number(m.known)*m.d/m.n;
    if (m.kind === 'whole') return number(m.known) * m.d / m.n;
    if (m.kind === 'groups') return number(m.total) * m.d / m.n;
    return number(m.total) * m.n / m.d;
  }
  const label = (x,y,text,klass='') => `<text x="${x}" y="${y}" class="${klass}">${esc(text)}</text>`;
  function svg(content, height = 230) {
    return `<svg viewBox="0 0 600 ${height}" aria-hidden="true" focusable="false">${content}</svg>`;
  }
  function strip(m, reveal) {
    const groupCount = resultFor(m);
    const unitWidth = 500 / groupCount;
    let out = label(50,35,`Total: ${m.total} ${m.unit || ''}`);
    const wire = m.object === 'wire';
    out += `<rect x="50" y="70" width="500" height="${wire ? 20 : 46}" rx="${wire ? 10 : 3}" class="os-whole ${wire ? 'os-wire' : 'os-ribbon'}"/>`;
    if (reveal) {
      for (let i=0;i<groupCount;i++) {
        out += `<rect x="${50+i*unitWidth}" y="70" width="${unitWidth}" height="${wire?20:46}" class="os-piece"/>`;
        out += label(50+(i+.5)*unitWidth,143,i+1,'os-small os-middle');
      }
      for(let whole=1;whole<number(m.total);whole++) out += `<path d="M${50+500*whole/number(m.total)} 65 v${wire?30:56}" class="os-whole-boundary"/>`;
    }
    out += `<path d="M50 171 v8 h${unitWidth} v-8" class="os-bracket"/>`;
    out += label(50,207,`One ${wire ? 'piece' : 'group'}: ${m.n}/${m.d} ${m.unit || ''}`);
    return svg(out);
  }
  function tank(m, reveal) {
    let out = label(290,43,`Whole tank: ${m.total} L`);
    out += '<rect x="60" y="30" width="160" height="180" rx="12" class="os-tank"/>';
    if (!m.showParts && !reveal) out += '<rect x="62" y="32" width="156" height="176" class="os-water"/>';
    for(let i=0;(m.showParts || reveal) && i<m.d;i++) {
      const y = 210 - (i+1)*180/m.d;
      out += `<rect x="62" y="${y}" width="156" height="${180/m.d}" class="${reveal && i<m.n ? 'os-selected' : 'os-water'}"/>`;
      if (m.showParts || reveal) out += `<path d="M62 ${y} H218" class="os-divider"/>`;
    }
    out += label(290,97,`Fraction used: ${m.n}/${m.d}`);
    out += label(290,149,reveal ? `Water used: ${m.result || resultFor(m)} L` : 'Water used: ?');
    return svg(out,245);
  }
  function fractionOf(m, reveal) {
    if(m.object === 'tank') return tank(m,reveal);
    if(m.object === 'area') {
      const total = window.RevilyValidators.parseRational(m.total);
      const columns = Number(total.d), selectedColumns = Number(total.n), rows = m.d;
      let out = label(280,52,`Known quantity: ${m.total}`) + label(280,100,`Take ${m.n}/${m.d} of that quantity`);
      for(let row=0;row<rows;row++) for(let col=0;col<columns;col++) {
        out += `<rect x="${50+col*180/columns}" y="${28+row*180/rows}" width="${180/columns}" height="${180/rows}" class="${col<selectedColumns ? reveal && row<m.n ? 'os-selected' : 'os-water' : 'os-empty'}"/>`;
      }
      out += label(50,225,'The square represents one whole.','os-small');
      return svg(out,248);
    }
    let out = label(50,30,`Known whole: ${m.total}`);
    const w = 500/m.d;
    for(let i=0;i<m.d;i++) {
      out += `<rect x="${50+i*w}" y="68" width="${w}" height="64" class="${reveal && i<m.n ? 'os-selected' : 'os-empty'}"/>`;
      if(m.showUnits || (reveal && m.object === 'students')) {
        const per = number(m.total)/m.d;
        for(let j=0;j<per;j++) out += `<circle cx="${50+i*w+(j+.5)*w/per}" cy="100" r="${Math.min(6,w/per/3)}" class="os-dot"/>`;
      }
    }
    out += label(50,180,`Select ${m.n} of ${m.d} equal shares.`);
    if(reveal) out += label(50,218,`Selected amount: ${m.result || resultFor(m)}`);
    return svg(out,245);
  }
  function rebuild(m,reveal) {
    const w = 500/m.d;
    let out = label(50,32,reveal ? `Whole: ${resultFor(m)}` : 'Whole: ?');
    for(let i=0;i<m.d;i++) out += `<rect x="${50+i*w}" y="65" width="${w}" height="67" class="${i<m.n?'os-selected':'os-unknown'}"/>`;
    out += `<path d="M50 146 v9 h${m.n*w} v-9" class="os-bracket"/>`;
    out += label(50,193,`Known part: ${m.n}/${m.d} is ${m.known}`);
    return svg(out,230);
  }
  function inverseAmount(m,reveal) {
    const known=number(m.known),per=known/m.n,whole=per*m.d;
    if(!Number.isInteger(known)||!Number.isInteger(per)||!Number.isInteger(m.n)||m.n<1||m.n>=m.d) throw new Error('Rebuilding an amount requires a known proper-fraction part and integer share values.');
    const phase=reveal?(m.resultScope==='unit'?'unit':'whole'):m.phase||'given';
    const format=value=>m.unit==='£'?`£${value}`:`${value}${m.unit?' '+m.unit:''}`;
    const wholeName=m.object==='money'?'Original money':m.object==='journey'?'Full journey':m.object==='students'?'Sports club':m.object==='tiles'?'All tiles':'Whole amount';
    const partName=m.object==='money'?'Spent on jacket':m.object==='journey'?'By train':m.object==='students'?'Year 10':m.object==='tiles'?'Blue tiles':'Known part';
    let out=label(32,30,`${wholeName}: ${phase==='whole'?format(whole):'?'}`);
    if(m.object==='tiles') {
      // Equal boxes represent equal fractional shares. Unknown groups contain no countable tiles.
      const cols=Math.ceil(Math.sqrt(m.d)),rows=Math.ceil(m.d/cols),boxW=536/cols,dotCols=Math.ceil(Math.sqrt(per)),boxH=35+24*Math.ceil(per/dotCols);
      for(let group=0;group<m.d;group++) {
        const x=32+(group%cols)*boxW,y=52+Math.floor(group/cols)*(boxH+10),visible=group<m.n||phase==='whole';
        out+=`<rect x="${x}" y="${y}" width="${boxW-10}" height="${boxH}" rx="8" class="${visible?'os-empty':'os-unknown'}" data-inverse-tile-share=""/>`;
        if(visible)for(let tile=0;tile<per;tile++)out+=`<rect x="${x+18+(tile%dotCols)*24}" y="${y+16+Math.floor(tile/dotCols)*24}" width="14" height="14" class="os-dot${group<m.n?' os-blue-tile':''}" data-tile=""/>`;
        else out+=label(x+(boxW-10)/2,y+boxH/2+7,'?','os-middle');
      }
      out+=label(32,rows*(boxH+10)+82,`${partName} (${m.n}/${m.d}): ${known}`);
      return svg(out,rows*(boxH+10)+108);
    }
    const w=536/m.d;
    for(let i=0;i<m.d;i++) {
      const valueKnown=phase==='whole'||phase==='unit'&&i<m.n;
      out+=`<rect x="${32+i*w}" y="72" width="${w}" height="67" class="${i<m.n?'os-selected':phase==='whole'?'os-empty':'os-unknown'}" data-known-part="${i<m.n}"/>`;
      out+=label(32+(i+.5)*w,113,valueKnown?(m.unit==='£'?`£${per}`:per):'?','os-middle');
    }
    out+=`<path d="M32 151 v8 h${m.n*w} v-8" class="os-bracket"/>`;
    out+=label(32,193,`${partName} (${m.n}/${m.d}): ${format(known)}`);
    if(phase==='unit')out+=label(32,230,`One equal part: ${format(per)}; whole still unknown.`,'os-small');
    if(phase==='whole')out+=label(32,230,`${m.d} equal parts rebuild the whole.`);
    return svg(out,phase==='given'?220:258);
  }
  function fractionLabel(x,y,n,d) {
    return `<g class="os-fraction-label">${label(x,y-8,n,'os-small os-middle')}<path d="M${x-15} ${y} h30" class="os-bracket"/>${label(x,y+21,d,'os-small os-middle')}</g>`;
  }
  function sameDenominatorAdd(m,reveal) {
    if(![m.a,m.b,m.d].every(Number.isInteger)||m.a<1||m.b<1||m.a+m.b>=m.d)throw new Error('Same-denominator addition requires two positive proper fractions with a proper sum.');
    const names={cake:'One cake',water:'Container capacity',journey:'One kilometre',flour:'One bag of flour',bars:'One unchanged whole'},name=names[m.object]||'One unchanged whole',w=500/m.d;
    const row=(y,count,klass)=>Array.from({length:m.d},(_,i)=>`<rect x="${50+i*w}" y="${y}" width="${w}" height="48" class="${i<count?klass:'os-empty'}"/>`).join('');
    let out=label(50,28,`${name}: ${m.d} equal parts`)+row(55,m.a,'os-water')+label(50,125,`First amount: ${m.a}/${m.d}`)+row(150,m.b,'os-mixed-second')+label(50,220,`Second amount: ${m.b}/${m.d}`);
    if(reveal)out+=row(247,m.a+m.b,'os-selected')+label(50,317,`Combined amount: ${m.a+m.b}/${m.d}`);
    else out+=label(50,278,'Combined amount: ?');
    return svg(out,reveal?342:305);
  }
  function oneMultipleAdd(m,reveal) {
    const values=[m.a,m.b,m.c,m.d];
    if(!values.every(Number.isInteger)||m.a<1||m.a>=m.b||m.c<1||m.c>=m.d||m.b===m.d||!(Math.max(m.b,m.d)%Math.min(m.b,m.d)===0))throw new Error('One-multiple addition requires two positive proper fractions with one denominator an exact multiple of the other.');
    const common=Math.max(m.b,m.d),first=m.a*(common/m.b),second=m.c*(common/m.d),sum=first+second;
    if(sum>=common)throw new Error('This one-multiple addition model requires a proper sum.');
    const row=(y,n,d,klass,attrs='')=>{const w=500/d;return Array.from({length:d},(_,i)=>`<rect x="${50+i*w}" y="${y}" width="${w}" height="48" class="${i<n?klass:'os-empty'}" ${attrs}/>`).join('');};
    const expression=`${m.a}/${m.b} + ${m.c}/${m.d}`;
    if(m.object==='jug') {
      const vessel=(x,n,d,klass,caption)=>{const y=58,w=125,h=205,cell=h/d;let art=`<path d="M${x} ${y} V${y+h} Q${x+w/2} ${y+h+22} ${x+w} ${y+h} V${y}" class="os-capacity-outline"/>`;for(let i=0;i<d;i++)art+=`<rect x="${x+4}" y="${y+h-(i+1)*cell}" width="${w-8}" height="${cell}" class="${i<n?klass:'os-empty'}"/>`;return art+label(x+w/2,307,caption,'os-small os-middle');};
      let out=label(32,28,'Two measured liquids')+vessel(45,m.a,m.b,'os-orange-liquid',`${m.a}/${m.b} L orange juice`)+label(226,165,'+','os-middle')+vessel(260,m.c,m.d,'os-water',`${m.c}/${m.d} L water`);
      if(reveal)out+=label(420,165,'=','os-middle')+vessel(440,sum,common,'os-selected',`${sum}/${common} L total`);
      else out+=label(465,165,'Total: ? L','os-small os-middle');
      return svg(out,335);
    }
    if(m.object==='journey') {
      let out=label(50,28,'The same complete journey')+row(55,m.a,m.b,'os-road-morning','data-journey-morning=""')+label(50,125,`Morning: ${m.a}/${m.b}`)+row(150,m.c,m.d,'os-road-afternoon','data-journey-afternoon=""')+label(50,220,`Afternoon: ${m.c}/${m.d}`);
      if(reveal)out+=row(247,sum,common,'os-selected','data-journey-total=""')+label(50,317,`Completed altogether: ${sum}/${common}`);else out+=label(50,278,'Completed altogether: ?');
      return svg(out,reveal?345:308);
    }
    if(m.object==='tank') {
      const tank=(x,n,d,klass,caption)=>{const y=55,w=145,h=225,cell=h/d;let art=`<path d="M${x} ${y} V${y+h} H${x+w} V${y}" class="os-capacity-outline"/>`;for(let i=0;i<d;i++)art+=`<rect x="${x+4}" y="${y+h-(i+1)*cell}" width="${w-8}" height="${cell}" class="${i<n?klass:'os-empty'}"/>`;for(let i=1;i<d;i++)art+=`<path d="M${x+4} ${y+i*cell} H${x+w-4}" class="os-divider"/>`;return art+label(x+w/2,310,caption,'os-small os-middle');};
      let out=label(32,28,'Reference whole: full tank capacity')+tank(45,m.a,m.b,'os-water',`Starts ${m.a}/${m.b} full`)+label(245,142,'Water added')+label(245,175,`${m.c}/${m.d} capacity`,'os-small');
      if(reveal)out+=`<path d="M210 182 H374" class="os-bracket"/>`+tank(410,sum,common,'os-selected',`Now ${sum}/${common} full`);else out+=label(480,184,'New level: ?','os-small os-middle');
      return svg(out,342);
    }
    if(m.object==='beads') {
      const bag=(x,count,color,caption)=>{let art=`<path d="M${x+35} 70 Q${x+80} 50 ${x+125} 70 L${x+145} 235 Q${x+80} 270 ${x+15} 235 Z" class="os-vessel"/>`;for(let i=0;i<count;i++){const cx=x+40+(i%4)*25,cy=105+Math.floor(i/4)*28;art+=`<circle cx="${cx}" cy="${cy}" r="8" class="${color}" data-bead=""/>`;}return art+label(x+80,292,caption,'os-small os-middle');};
      let out=label(32,28,'Two labelled bead masses')+bag(55,5,'os-red-bead',`${m.a}/${m.b} kg red beads`)+label(300,165,'?','os-middle')+bag(375,5,'os-blue-bead',`${m.c}/${m.d} kg blue beads`);
      if(reveal)out+=label(300,330,'Finding a total means add the two masses.','os-small os-middle');
      return svg(out,reveal?355:320);
    }
    let out=label(50,28,`Add: ${expression}`)+row(55,m.a,m.b,'os-water','data-add-first=""')+label(50,125,`First fraction: ${m.a}/${m.b}`)+row(150,m.c,m.d,'os-mixed-second','data-add-second=""')+label(50,220,`Second fraction: ${m.c}/${m.d}`);
    if(reveal) {
      out+=label(50,260,`Use common denominator ${common}: ${first}/${common} + ${second}/${common}`)+row(285,first,common,'os-water','data-add-renamed-first=""')+row(346,second,common,'os-mixed-second','data-add-renamed-second=""')+row(407,sum,common,'os-selected','data-add-result=""')+label(50,477,`Exact sum: ${sum}/${common}`);
      return svg(out,505);
    }
    out+=label(50,264,'Common-denominator form and sum: ?');
    return svg(out,295);
  }
  function bothDenominatorsAdd(m,reveal,workingRevealed) {
    if(![m.a,m.b,m.c,m.d].every(Number.isInteger)||m.a<1||m.a>=m.b||m.c<1||m.c>=m.d||m.b%m.d===0||m.d%m.b===0)throw new Error('Both-denominator addition needs proper fractions with neither denominator a multiple of the other.');
    const common=m.b*m.d/gcdInt(m.b,m.d),first=m.a*(common/m.b),second=m.c*(common/m.d),sum=first+second;
    if(sum>=common)throw new Error('Both-denominator addition requires a proper sum.');
    const math=window.RevilyVisuals.mathMarkup,count=m.solved?4:reveal?workingRevealed||1:0;
    const strip=(n,d,color,tag)=>`<svg viewBox="0 0 500 42" aria-hidden="true" data-both-row="${tag}">${Array.from({length:d},(_,i)=>`<rect x="${i*500/d}" y="1" width="${500/d}" height="40" class="${i<n?color:'os-empty'}" data-both-part="${tag}" data-filled="${i<n}"/>`).join('')}</svg>`;
    const row=(title,n,d,color,tag)=>`<section class="os-both-row"><p>${math(`${title}: ${n}/${d}`)}</p>${strip(n,d,color,tag)}</section>`;
    const vessel=(n,d,color,kind)=>`<svg viewBox="0 0 180 150" class="os-both-vessel" aria-hidden="true" data-both-${kind}="">${Array.from({length:d},(_,i)=>`<rect x="31" y="${130-(i+1)*100/d}" width="98" height="${100/d}" class="${i<n?color:'os-empty'}"/>`).join('')}<path d="M30 25 V130 H130 V25${kind==='jug'?' L118 18 M130 48 Q175 40 164 90 Q158 114 130 105':' M30 25 Q80 5 130 25 M30 25 Q80 42 130 25'}" class="os-capacity-outline"/></svg>`;
    let out='<div class="os-both-add">';
    if(m.object==='bars')out+=`<h2>${math(`${m.a}/${m.b} + ${m.c}/${m.d}`)}</h2><p>One unchanged reference whole</p>`+row('First fraction',m.a,m.b,'os-water','first')+row('Second fraction',m.c,m.d,'os-mixed-second','second');
    else if(m.object==='jug'||m.object==='paint'){
      const paint=m.object==='paint';out+=`<h2>${paint?'Two measured paint volumes':'Water in the jug'}</h2><p>Volume scale: 1 litre</p><div class="os-both-context">`;
      out+=`<section>${vessel(m.a,m.b,paint?'os-red-bead':'os-water',paint?'paint':'jug')}<p>${math(`${paint?'Red paint':'Water already in jug'}: ${m.a}/${m.b} L`)}</p></section>`;
      out+=`<section>${vessel(m.c,m.d,paint?'os-white-paint':'os-water',paint?'paint':'jug')}<p>${math(`${paint?'White paint':'Further water'}: ${m.c}/${m.d} L`)}</p></section></div>`;
      if(paint)return out+`<p class="os-both-result">${reveal?math(`Calculation: ${m.a}/${m.b} + ${m.c}/${m.d}`):'Calculation: choose below'}</p></div>`;
    } else if(m.object==='journey')out+='<h2>Aisha’s journey</h2><p>Each track represents the same whole journey.</p>'+row('Before lunch',m.a,m.b,'os-road-morning','journey-before')+row('After lunch',m.c,m.d,'os-road-afternoon','journey-after');
    else if(m.object==='ribbon')out+='<h2>Two ribbon lengths</h2><p>Each scale represents 1 metre.</p>'+row('Red ribbon (m)',m.a,m.b,'os-red-bead','ribbon-red')+row('Blue ribbon (m)',m.c,m.d,'os-blue-bead','ribbon-blue');
    else throw new Error('Unknown both-denominator context.');
    if(count>=1)out+=`<p data-both-common="">Common denominator: <b>${common}</b></p>`;
    if(count>=2)out+=`<div data-both-conversion="first"><p>${math(`${m.a}/${m.b}`)} = ${window.RevilyVisuals.fractionMarkup(`${m.a} × ${common/m.b}`,`${m.b} × ${common/m.b}`)} = ${math(`${first}/${common}`)}</p>${strip(first,common,'os-water','renamed-first')}</div>`;
    if(count>=3)out+=`<div data-both-conversion="second"><p>${math(`${m.c}/${m.d}`)} = ${window.RevilyVisuals.fractionMarkup(`${m.c} × ${common/m.d}`,`${m.d} × ${common/m.d}`)} = ${math(`${second}/${common}`)}</p>${strip(second,common,'os-mixed-second','renamed-second')}</div>`;
    if(count>=4)out+=`<div data-both-result=""><p>${math(`${first}/${common} + ${second}/${common} = ${sum}/${common}${m.object==='jug'?' L':m.object==='ribbon'?' m':''}`)}</p>${strip(sum,common,'os-selected','result')}</div>`;
    else out+='<p class="os-both-result">Combined amount: ?</p>';
    return out+'</div>';
  }
  function bothDenominatorsSubtract(m,reveal,workingRevealed) {
    if(![m.a,m.b,m.c,m.d].every(Number.isInteger)||m.a<1||m.a>=m.b||m.c<1||m.c>=m.d||m.b%m.d===0||m.d%m.b===0)throw new Error('Both-denominator subtraction needs proper fractions with neither denominator a multiple of the other.');
    const common=m.b*m.d/gcdInt(m.b,m.d),first=m.a*(common/m.b),second=m.c*(common/m.d),difference=first-second;
    if(difference<=0||difference>=common)throw new Error('Both-denominator subtraction requires a positive proper difference.');
    const math=window.RevilyVisuals.mathMarkup,count=m.solved?4:reveal?workingRevealed||1:0;
    const strip=(n,d,color,tag)=>`<svg viewBox="0 0 500 42" aria-hidden="true" data-both-sub-row="${tag}">${Array.from({length:d},(_,i)=>`<rect x="${i*500/d}" y="1" width="${500/d}" height="40" class="${i<n?color:'os-empty'}" data-both-sub-part="${tag}" data-filled="${i<n}"/>`).join('')}</svg>`;
    const row=(title,n,d,color,tag)=>`<section class="os-both-row"><p>${math(`${title}: ${n}/${d}`)}</p>${strip(n,d,color,tag)}</section>`;
    const remaining=()=>`<svg viewBox="0 0 500 42" aria-hidden="true" data-both-sub-row="result">${Array.from({length:common},(_,i)=>{const removed=i<second,w=500/common;return `<rect x="${i*w}" y="1" width="${w}" height="40" class="${removed?'os-removed':i<first?'os-selected':'os-empty'}" data-both-sub-part="result" data-removed="${removed}" data-remaining="${!removed&&i<first}"/>`+(removed?`<path d="M${i*w+2} 6 L${(i+1)*w-2} 36 M${i*w+2} 36 L${(i+1)*w-2} 6" class="os-removal-cross" data-both-sub-cross=""/>`:'');}).join('')}</svg>`;
    const vessel=(n,d,paint)=>`<svg viewBox="0 0 180 150" class="os-both-vessel" aria-hidden="true" data-both-sub-${paint?'paint':'tank'}="">${Array.from({length:d},(_,i)=>`<rect x="31" y="${130-(i+1)*100/d}" width="118" height="${100/d}" class="${i<n?(paint?'os-ribbon-given':'os-water'):'os-empty'}"/>`).join('')}<path d="M30 25 V130 H150 V25${paint?' M30 25 Q90 5 150 25 M30 25 Q90 43 150 25':''}" class="os-capacity-outline"/></svg>`;
    let out='<div class="os-both-add os-both-subtract">';
    if(m.object==='bars')out+=`<h2>${math(`${m.a}/${m.b} − ${m.c}/${m.d}`)}</h2><p>One unchanged reference whole</p>`+row('Starting fraction',m.a,m.b,'os-water','first')+row('Fraction to remove',m.c,m.d,'os-mixed-second','second');
    else if(m.object==='ribbon')out+='<h2>Ribbon and the length cut off</h2><p>Each scale represents 1 metre.</p>'+row('Starting ribbon (m)',m.a,m.b,'os-ribbon-given','ribbon-start')+row('Length cut off (m)',m.c,m.d,'os-mixed-second','ribbon-cut');
    else if(m.object==='walk')out+='<h2>Hassan’s walking route</h2><p>Each distance scale represents 1 kilometre.</p>'+row('Whole route (km)',m.a,m.b,'os-road-afternoon','walk-route')+row('Already walked (km)',m.c,m.d,'os-road-morning','walk-completed');
    else if(m.object==='tank')out+='<h2>Water left in the tank</h2><p>Reference whole: the tank’s full capacity.</p>'+vessel(m.a,m.b,false)+`<p>${math(`Initially full: ${m.a}/${m.b}`)}</p>`+row('Capacity removed',m.c,m.d,'os-mixed-second','tank-removed');
    else if(m.object==='paint')return out+'<h2>Paint in the container</h2><p>Volume scale: 1 litre</p>'+vessel(m.a,m.b,true)+`<p>${math(`Starting paint: ${m.a}/${m.b} L`)}</p><p>${math(`Decorator uses: ${m.c}/${m.d} L`)}</p><p>${reveal?math(`Calculation: ${m.a}/${m.b} − ${m.c}/${m.d}`):'Calculation: choose below'}</p></div>`;
    else throw new Error('Unknown both-denominator subtraction context.');
    if(count>=1)out+=`<p data-both-sub-common="">Common denominator: <b>${common}</b></p>`;
    if(count>=2)out+=`<div data-both-sub-conversion="first"><p>${math(`${m.a}/${m.b}`)} = ${window.RevilyVisuals.fractionMarkup(`${m.a} × ${common/m.b}`,`${m.b} × ${common/m.b}`)} = ${math(`${first}/${common}`)}</p>${strip(first,common,'os-water','renamed-first')}</div>`;
    if(count>=3)out+=`<div data-both-sub-conversion="second"><p>${math(`${m.c}/${m.d}`)} = ${window.RevilyVisuals.fractionMarkup(`${m.c} × ${common/m.d}`,`${m.d} × ${common/m.d}`)} = ${math(`${second}/${common}`)}</p>${strip(second,common,'os-mixed-second','renamed-second')}</div>`;
    if(count>=4)out+=`<div data-both-sub-result=""><p>${math(`${first}/${common} − ${second}/${common} = ${difference}/${common}${m.object==='ribbon'?' m':m.object==='walk'?' km':''}`)}</p>${remaining()}<p>${m.object==='walk'?'The marked parts have been walked. The green parts remain.':'The crossed-out parts are removed. The green parts remain.'}</p></div>`;
    else out+='<p class="os-both-result">Remaining amount: ?</p>';
    return out+'</div>';
  }
  function lowestCommonDenominator(m,reveal) {
    if(![m.a,m.b].every(x=>Number.isInteger(x)&&x>=2&&x<=20))throw new Error('Lowest-common-denominator models require whole-number denominators from 2 to 20.');
    if(!['question','lists','candidate','statement','missing_multiple'].includes(m.mode||'question')||(m.mode==='candidate'&&(!Number.isInteger(m.candidate)||m.candidate<1)))throw new Error('Lowest-common-denominator models require a valid mode and explicit candidate when applicable.');
    const answer=m.a*m.b/gcdInt(m.a,m.b),math=window.RevilyVisuals.mathMarkup;
    if(m.fractions&&(!Array.isArray(m.fractions)||m.fractions.length!==2||m.fractions.some((f,i)=>!Array.isArray(f)||f.length!==2||!Number.isInteger(f[0])||f[0]<1||f[0]>=f[1]||f[1]!==[m.a,m.b][i])))throw new Error('Lowest-common-denominator fractions must match the authored denominator pair.');
    const makeList=base=>Array.from({length:answer/base},(_,i)=>(i+1)*base),lists=m.lists||[makeList(m.a),makeList(m.b)];
    if(!Array.isArray(lists)||lists.length!==2||lists.some((list,i)=>!Array.isArray(list)||!list.length||list.some((value,index)=>value!==[m.a,m.b][i]*(index+1))))throw new Error('Lowest-common-denominator lists must contain consecutive positive multiples.');
    const chips=(base,values,mark)=>`<section class="os-lcd-list"><h3>Multiples of ${base}</h3><div class="os-lcd-chips">${values.map((value,index)=>`<span class="os-lcd-chip${mark&&value===answer?' is-lowest':mark&&lists[0].includes(value)&&lists[1].includes(value)?' is-common':''}" data-lcd-chip="${base}"${value===null?' data-lcd-blank=""':''}>${value===null?(reveal?(index+1)*base:'?'):value}</span>`).join('')}<span class="os-lcd-ellipsis">…</span></div></section>`;
    if(m.mode==='missing_multiple') {
      if(![m.a,m.b].includes(m.list_base)||!Array.isArray(m.values)||m.values.filter(x=>x===null).length!==1||m.values.some((value,index)=>value!==null&&value!==m.list_base*(index+1)))throw new Error('A guided multiple list requires one authored blank in consecutive multiples.');
      return `<div class="os-lcd-model" data-lcd-mode="missing_multiple">${chips(m.list_base,m.values,false)}<p class="os-lcd-task">Complete the missing multiple.</p></div>`;
    }
    const title=m.object==='prepare_addition'?'Prepare for the addition':m.object==='prepare_subtraction'?'Prepare for the subtraction':m.object==='prepare_rewriting'?'Prepare a shared denominator':m.object==='critique'?'Check the lowest-value claim':'Compare the denominators';
    const fractions=m.expression?`<p class="os-lcd-source">${math(m.expression)}</p>`:m.fractions?`<p class="os-lcd-source">${math(`${m.fractions[0][0]}/${m.a}`)} <span>and</span> ${math(`${m.fractions[1][0]}/${m.b}`)}</p>`:'';
    let out=`<div class="os-lcd-model" data-lcd-mode="${esc(m.mode||'question')}"><h2>${title}</h2>${fractions}<div class="os-lcd-denominators"><span>Denominator <b>${m.a}</b></span><span>Denominator <b>${m.b}</b></span></div>`;
    if(m.mode==='candidate')out+=`<p class="os-lcd-candidate">${m.claim?`${math(m.claim)}<br/>`:''}Candidate denominator: <strong>${esc(m.candidate)}</strong></p>`;
    if(m.mode==='lists'||reveal)out+=chips(m.a,lists[0],reveal)+chips(m.b,lists[1],reveal);
    out+=`<p class="os-lcd-answer">${esc(m.result_label||'Lowest common denominator')}: <strong${reveal?' data-lcd-result=""':''}>${reveal?answer:'?'}</strong></p>`;
    if(reveal&&lists[0].some(value=>value>answer&&lists[1].includes(value)))out+='<p class="os-lcd-task">Later shared values are common, but not lowest.</p>';
    return out+'</div>';
  }
  function oneMultipleSubtract(m,reveal) {
    if(![m.a,m.b,m.c,m.d].every(Number.isInteger)||m.a<1||m.a>=m.b||m.c<1||m.c>=m.d||m.b===m.d||Math.max(m.b,m.d)%Math.min(m.b,m.d)!==0)throw new Error('One-multiple subtraction requires two positive proper fractions with one denominator an exact multiple of the other.');
    const common=Math.max(m.b,m.d),first=m.a*(common/m.b),second=m.c*(common/m.d),difference=first-second;
    if(difference<=0||difference>=common)throw new Error('One-multiple subtraction requires a positive proper difference.');
    const row=(y,n,d,klass,attrs='',height=48)=>{const w=500/d;return Array.from({length:d},(_,i)=>`<rect x="${50+i*w}" y="${y}" width="${w}" height="${height}" class="${i<n?klass:'os-empty'}" ${attrs}/>`).join('');};
    const removalRow=(y,height=48)=>{const w=500/common;let art='';for(let i=0;i<common;i++){const removed=i<second;art+=`<rect x="${50+i*w}" y="${y}" width="${w}" height="${height}" class="${removed?'os-removed':i<first?'os-selected':'os-empty'}" data-sub-result="" data-removed="${removed}"/>`;if(removed)art+=`<path d="M${54+i*w} ${y+7} L${46+(i+1)*w} ${y+height-7} M${54+i*w} ${y+height-7} L${46+(i+1)*w} ${y+7}" class="os-removal-cross" data-sub-cross=""/>`;}return art;};
    if(m.object==='bottle'||m.object==='tank') {
      const bottle=m.object==='bottle';
      const vessel=(x,n,d,klass,caption)=>{const y=85,w=132,h=192,cell=h/d;let art='';for(let i=0;i<d;i++)art+=`<rect x="${x+4}" y="${y+h-(i+1)*cell}" width="${w-8}" height="${cell}" class="${i<n?klass:'os-empty'}" data-sub-vessel-part=""/>`;art+=bottle?`<path d="M${x+44} 35 H${x+88} V62 L${x+w} ${y} V${y+h-8} Q${x+w} ${y+h} ${x+w-10} ${y+h} H${x+10} Q${x} ${y+h} ${x} ${y+h-8} V${y} L${x+44} 62 Z" class="os-capacity-outline" data-sub-bottle=""/>`:`<path d="M${x} ${y} V${y+h} H${x+w} V${y}" class="os-capacity-outline" data-sub-tank=""/>`;return art+label(x+w/2,310,caption,'os-small os-middle');};
      let out=label(32,28,bottle?'Bottle water · volume scale: 1 L':'Reference whole: full tank capacity')+vessel(50,m.a,m.b,'os-water',bottle?`Starts at ${m.a}/${m.b} L`:`Starts ${m.a}/${m.b} full`)+label(297,128,bottle?'Hana pours out':'Water removed','os-small os-middle')+label(297,158,`${m.c}/${m.d}${bottle?' L':' capacity'}`,'os-small os-middle');
      if(reveal)out+=vessel(410,difference,common,'os-selected',bottle?`${difference}/${common} L remains`:`${difference}/${common} full remains`)+label(300,347,`${m.c}/${m.d} = ${second}/${common}; ${first}/${common} − ${second}/${common} = ${difference}/${common}`,'os-small os-middle');
      else out+=label(476,205,'Remaining: ?','os-small os-middle');
      return svg(out,reveal?375:337);
    }
    if(m.object==='ribbon') {
      let out=label(50,28,'Reference length: 1 metre')+row(66,m.a,m.b,'os-ribbon-given','data-sub-ribbon-start=""',30)+`<path d="M50 107 v9 h500 v-9" class="os-bracket"/>`+label(50,151,`Ribbon length: ${m.a}/${m.b} m`)+row(184,m.c,m.d,'os-mixed-second','data-sub-ribbon-cut=""',30)+label(50,253,`Length cut off: ${m.c}/${m.d} m`);
      if(reveal)out+=removalRow(286,30)+`<path d="M${50+second*500/common} 271 v60" class="os-cut-boundary" data-sub-cut-boundary=""/>`+label(50,365,`Ribbon remaining: ${difference}/${common} m`);else out+=label(50,301,'Remaining length: ? m');
      return svg(out,reveal?392:330);
    }
    if(m.object==='rice') {
      let out=label(32,28,'Rice before and after the chef uses some')+`<path d="M105 65 Q170 49 235 65 L260 244 Q170 280 80 244 Z" class="os-vessel" data-sub-rice-bag=""/>`+label(170,150,'Rice in bag','os-small os-middle')+label(170,187,`${m.a}/${m.b} kg`,'os-middle')+`<path d="M365 177 H535 Q525 246 450 246 Q375 246 365 177 Z" class="os-vessel" data-sub-rice-used=""/>`+label(450,126,'Chef uses','os-small os-middle')+label(450,157,`${m.c}/${m.d} kg`,'os-middle')+label(300,304,'Mass remaining: ?','os-middle');
      if(reveal)out+=label(300,349,`Use ${m.a}/${m.b} − ${m.c}/${m.d} to find the mass left.`,'os-small os-middle');
      return svg(out,reveal?378:334);
    }
    let out=label(50,28,`Subtract: ${m.a}/${m.b} − ${m.c}/${m.d}`)+row(55,m.a,m.b,'os-water','data-sub-first=""')+label(50,125,`Starting fraction: ${m.a}/${m.b}`)+row(150,m.c,m.d,'os-mixed-second','data-sub-second=""')+label(50,220,`Fraction removed: ${m.c}/${m.d}`);
    if(reveal){out+=label(50,262,`Use denominator ${common}: ${first}/${common} − ${second}/${common}`)+row(288,first,common,'os-water','data-sub-renamed-first=""')+row(350,second,common,'os-mixed-second','data-sub-renamed-second=""')+removalRow(414)+label(50,489,`Exact difference: ${difference}/${common}`);return svg(out,517);}
    out+=label(50,264,'Common-denominator form and difference: ?');return svg(out,295);
  }
  function sameDenominatorSubtract(m,reveal) {
    if(![m.a,m.b,m.d].every(Number.isInteger)||m.a<1||m.a>=m.d||m.b<1||m.b>=m.a)throw new Error('Same-denominator subtraction requires two positive proper fractions and a positive difference.');
    const remaining=m.a-m.b,w=500/m.d;
    const names={bottle:'One litre bottle',tank:'Full tank capacity',ribbon:'One metre ribbon',rice:'One kilogram bag',bars:'One unchanged whole'};
    const actions={bottle:'Mia drinks',tank:'Water removed',ribbon:'Length cut off',rice:'Chef uses',bars:'Remove'};
    const name=names[m.object]||'One unchanged whole',action=actions[m.object]||'Remove';
    const row=(y,count,klass,attr='')=>Array.from({length:m.d},(_,i)=>`<rect x="${50+i*w}" y="${y}" width="${w}" height="48" class="${i<count?klass:'os-empty'}" ${attr}/>`).join('');
    if(['bottle','tank'].includes(m.object)) {
      const vessel=(x,count,klass,labelText)=>{
        const height=210,cellH=height/m.d,y=54;
        let art=`<rect x="${x}" y="${y}" width="145" height="${height}" rx="${m.object==='bottle'?28:10}" class="os-capacity-outline" data-subtract-vessel="${esc(labelText)}"/>`;
        for(let i=0;i<m.d;i++)art+=`<rect x="${x+4}" y="${y+height-(i+1)*cellH}" width="137" height="${cellH}" class="${i<count?klass:'os-empty'}"/>`;
        for(let i=1;i<m.d;i++)art+=`<path d="M${x+4} ${y+i*cellH} H${x+141}" class="os-divider"/>`;
        return art+label(x+72.5,292,labelText,'os-small os-middle');
      };
      let out=label(32,28,`${name}: ${m.d} equal capacity parts`)+vessel(50,m.a,'os-water',`Starts at ${m.a}/${m.d}`);
      out+=label(300,120,`${action} ${m.b}/${m.d}`,'os-middle')+`<path d="M225 158 H375" class="os-bracket"/>`;
      if(reveal)out+=vessel(405,remaining,'os-selected',`Remains ${remaining}/${m.d}`);
      else out+=label(477,190,'Remaining amount: ?','os-small os-middle');
      return svg(out,325);
    }
    const initialLabel=m.object==='ribbon'?`Ribbon starts at ${m.a}/${m.d} m`:m.object==='rice'?`Rice in the bag: ${m.a}/${m.d} kg`:`Starting amount: ${m.a}/${m.d}`;
    const removalLabel=`${action}: ${m.b}/${m.d}${m.unit?' '+m.unit:''}`;
    const resultLabel=m.object==='ribbon'?`Ribbon remaining: ${remaining}/${m.d} m`:m.object==='rice'?`Rice remaining: ${remaining}/${m.d} kg`:`Remaining amount: ${remaining}/${m.d}`;
    let out=label(50,28,`${name}: ${m.d} equal parts`)+row(55,m.a,m.object==='ribbon'?'os-ribbon-given':'os-water','data-subtract-start=""')+label(50,125,initialLabel)+row(150,m.b,'os-mixed-second','data-subtract-removed=""')+label(50,220,removalLabel);
    if(reveal)out+=row(247,remaining,'os-selected','data-subtract-remaining=""')+label(50,317,resultLabel);
    else out+=label(50,278,'Remaining amount: ?');
    return svg(out,reveal?342:305);
  }
  function equivalentFraction(m,reveal) {
    const values=[m.n,m.d,m.target_n,m.target_d];
    if(!values.every(Number.isInteger)||m.n<1||m.d<2||m.n>=m.d||m.target_n<1||m.target_d<2||m.target_n>=m.target_d||m.n*m.target_d!==m.d*m.target_n)throw new Error('Equivalent-fraction models require two explicitly authored equal positive proper fractions.');
    if(!['numerator','denominator','choice','teaching'].includes(m.missing))throw new Error('Equivalent-fraction models require an authored missing-part role.');
    const row=(y,n,d,known=true,attrs='')=>{const w=500/d;return Array.from({length:d},(_,i)=>`<rect x="${50+i*w}" y="${y}" width="${w}" height="52" class="${known?(i<n?'os-selected':'os-empty'):'os-unknown'}" ${attrs}/>`).join('');};
    const fractionText=(n,d)=>`${n}/${d}`;
    const targetBefore=m.missing==='numerator'?`?/${m.target_d}`:m.missing==='denominator'?`${m.target_n}/?`:'Choose an equivalent fraction';
    if(m.object==='class'||m.object==='survey') {
      const total=m.target_d,selected=m.target_n,cols=m.object==='class'?10:15,rows=Math.ceil(total/cols),gapX=500/cols,gapY=42;
      let out=label(50,28,m.object==='class'?`Class: ${total} students`:`Survey: ${total} people`);
      for(let i=0;i<total;i++) {
        const x=50+(i%cols)*gapX+gapX/2,y=63+Math.floor(i/cols)*gapY,on=reveal&&i<selected;
        if(m.object==='class')out+=`<g data-equivalent-item="student"><circle cx="${x}" cy="${y-9}" r="7" class="${on?'os-bus-student':'os-unknown'}"/><path d="M${x} ${y-1} v17 M${x-9} ${y+5} h18 M${x} ${y+16} l-8 14 M${x} ${y+16} l8 14" class="${on?'os-bus-line':'os-person-line'}"/></g>`;
        else out+=`<g data-equivalent-item="survey"><rect x="${x-9}" y="${y-12}" width="18" height="24" rx="3" class="${on?'os-survey-selected':'os-unknown'}"/>${on?`<path d="M${x-5} ${y} l4 5 l8-11" class="os-check-line"/>`:''}</g>`;
      }
      const bottom=63+(rows-1)*gapY+42;
      out+=label(50,bottom,`${m.n}/${m.d} of the ${m.object==='class'?'students travel by bus':'people chose option A'}.`);
      out+=label(50,bottom+39,reveal?`${m.n}/${m.d} = ${m.target_n}/${m.target_d}`:`Equivalent count: ?/${m.target_d}`);
      return svg(out,bottom+68);
    }
    if(m.object==='tank') {
      const x=72,y=48,w=190,h=280,cell=h/m.target_d;
      let out=label(310,36,`Tank scale: ${m.target_d} equal intervals`)+`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="os-tank" data-equivalent-tank=""/>`;
      for(let i=0;i<m.target_d;i++) {
        const cy=y+h-(i+1)*cell;
        out+=`<rect x="${x+4}" y="${cy}" width="${w-8}" height="${cell}" class="${reveal&&i<m.target_n?'os-water':'os-empty'}"/>`;
        if(i)out+=`<path d="M${x+4} ${cy} H${x+w-4}" class="os-divider"/>`;
      }
      out+=label(310,105,'Water level: 2/7 full')+label(310,166,reveal?`${m.target_n} of ${m.target_d} intervals`:'Filled intervals: ?')+label(310,217,reveal?'Same proportion':'Keep the proportion fixed','os-small');
      return svg(out,360);
    }
    if(m.object==='diagram') {
      const cols=6,rows=4,cw=500/cols,ch=180/rows;
      let out=label(50,28,`${m.n} of ${m.d} equal parts are shaded.`);
      for(let i=0;i<m.d;i++)out+=`<rect x="${50+(i%cols)*cw}" y="${55+Math.floor(i/cols)*ch}" width="${cw}" height="${ch}" class="${i<m.n?'os-selected':'os-empty'}" data-diagram-part=""/>`;
      out+=label(50,270,reveal?`${m.n}/${m.d} = ${m.target_n}/${m.target_d}`:'Equivalent fraction: ?');
      if(reveal)out+=row(298,m.target_n,m.target_d,true,'data-equivalent-target=""');
      return svg(out,reveal?382:302);
    }
    let out=label(50,28,`Known fraction: ${fractionText(m.n,m.d)}`)+row(55,m.n,m.d,true,'data-equivalent-source=""');
    if(reveal) {
      out+=label(50,139,`Same proportion: ${fractionText(m.target_n,m.target_d)}`)+row(166,m.target_n,m.target_d,true,'data-equivalent-target=""');
      out+=label(50,248,`${fractionText(m.n,m.d)} = ${fractionText(m.target_n,m.target_d)}`);
    } else {
      out+=label(50,145,`Target fraction: ${targetBefore}`);
      if(m.missing==='numerator')out+=row(170,0,m.target_d,false,'data-equivalent-unknown=""');
      else if(m.missing==='denominator') {
        const shown=Math.min(m.target_n,20),w=420/shown;
        for(let i=0;i<shown;i++)out+=`<rect x="${50+i*w}" y="170" width="${w}" height="52" class="os-selected" data-known-target-part=""/>`;
        out+=label(492,205,'… ? total parts','os-small');
      }
    }
    return svg(out,reveal?278:m.missing==='choice'?180:248);
  }
  function simplifyFraction(m,reveal) {
    if(![m.n,m.d].every(Number.isInteger)||m.n<1||m.d<2||m.n>=m.d)throw new Error('Fraction simplification requires an explicitly authored positive proper fraction.');
    const g=gcdInt(m.n,m.d),sn=m.n/g,sd=m.d/g;
    if(m.factor!==undefined&&(!Number.isInteger(m.factor)||m.factor<2||m.n%m.factor||m.d%m.factor))throw new Error('An authored simplification factor must divide both parts exactly.');
    const drawBar=(y,n,d,klass,attrs='')=>{const w=500/d;return Array.from({length:d},(_,i)=>`<rect x="${50+i*w}" y="${y}" width="${w}" height="52" class="${i<n?klass:'os-empty'}" ${attrs}/>`).join('');};
    const context=m.object&&m.object!=='bars';
    let out='';
    if(context) {
      const names={counters:'Counters in the bag',class:'Students in the class',pencils:'Pencils in the box'},name=names[m.object]||'Items in the set';
      const selectedNames={counters:'red',class:'boys',pencils:'green'},otherNames={counters:'blue',class:'girls',pencils:'yellow'};
      const cols=Math.min(m.d,m.object==='pencils'?18:14),rows=Math.ceil(m.d/cols),gapX=500/cols,gapY=42;
      out+=label(50,28,`${name}: ${m.d} items`);
      for(let i=0;i<m.d;i++) {
        const x=50+(i%cols)*gapX+gapX/2,y=58+Math.floor(i/cols)*gapY,selected=i<m.n;
        const klass=m.object==='counters'?(selected?'os-red-counter':'os-blue-counter'):m.object==='pencils'?(selected?'os-green-pencil':'os-yellow-pencil'):(selected?'os-selected':'os-water');
        if(m.object==='pencils')out+=`<rect x="${x-6}" y="${y-14}" width="12" height="30" rx="3" class="${klass}" data-context-item="pencil"/>`;
        else out+=`<circle cx="${x}" cy="${y}" r="${m.object==='class'?9:8}" class="${klass}" data-context-item="${m.object}"/>`;
      }
      const setBottom=58+(rows-1)*gapY+(m.object==='pencils'?48:28);
      out+=label(50,setBottom,`${m.n} ${selectedNames[m.object]||'selected'}; ${m.d-m.n} ${otherNames[m.object]||'other'} → fraction ${m.n}/${m.d}`);
      if(reveal)out+=label(50,setBottom+42,g===1?`${m.n}/${m.d} is already in simplest form.`:`Group both counts by ${g}: ${m.n}/${m.d} = ${sn}/${sd}.`)+drawBar(setBottom+63,sn,sd,'os-selected','data-simplified-part=""');
      else out+=label(50,setBottom+42,'Simplest form: ?');
      return svg(out,setBottom+(reveal?140:72));
    }
    out=label(50,28,`Original fraction: ${m.n}/${m.d}`)+drawBar(55,m.n,m.d,'os-water','data-original-part=""');
    if(reveal) {
      out+=label(50,137,g===1?'No common factor greater than 1':`Divide both counts by ${g}`);
      out+=drawBar(165,sn,sd,'os-selected','data-simplified-part=""')+label(50,245,g===1?`Already in simplest form: ${sn}/${sd}`:`Same amount, simplest form: ${sn}/${sd}`);
    } else out+=label(50,145,'Simplest form: ?');
    return svg(out,reveal?275:180);
  }
  function fractionProduct(m,reveal) {
    const {a,b,c,d}=m;
    if(![a,b,c,d].every(Number.isInteger)||a<1||a>=b||c<1||c>=d)throw new Error('Fraction product requires two explicitly authored positive proper fractions.');
    const phase=reveal?(m.resultScope||'overlap'):m.phase||'question';
    const overlap=phase==='overlap',partition=['partition','overlap','numerator','denominator'].includes(phase);
    const tank=['tank','container'].includes(m.object),ribbon=m.object==='ribbon';
    const reference=ribbon?'Reference length: 1 m':tank?'Reference whole: full capacity':m.object==='field'?'Reference whole: the full field':m.object==='flour'?'Reference whole: a full bag':'Reference whole: one rectangle';
    let out=label(32,30,reference);
    if(m.object==='card') {
      const x=110,y=95,w=260,h=260,cardW=w*a/b,cardH=h*c/d;
      out=label(32,30,'Reference square: 1 m by 1 m');
      out+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="os-unknown"/>`;
      if(overlap)for(let row=0;row<d;row++)for(let col=0;col<b;col++)out+=`<rect x="${x+col*w/b}" y="${y+row*h/d}" width="${w/b}" height="${h/d}" class="${col<a&&row<c?'os-selected':'os-empty'}" data-card-cell="" data-card-selected="${col<a&&row<c}"/>`;
      else out+=`<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" class="os-water"/>`;
      out+=`<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" class="os-capacity-outline"/>`;
      out+=label(x+cardW/2,y-24,`${m.horizontal_label||'Length'} ${a}/${b} m`,'os-small os-middle')+label(x+cardW+16,y+cardH/2,`${m.vertical_label||'Width'} ${c}/${d} m`,'os-small');
      out+=label(32,380,overlap?`${m.context_name||'Card'} area: ${a*c}/${b*d} m²`:`Area of the ${(m.context_name||'card').toLowerCase()}: ? m²`);return svg(out,412);
    }
    if(ribbon) {
      const x=55,y=79,w=490,h=56,known=w*c/d;
      for(let col=0;col<d;col++)out+=`<rect x="${x+col*w/d}" y="${y}" width="${w/d}" height="${h}" class="${col<c?'os-ribbon-given':'os-empty'}" data-product-base=""/>`;
      out+=label(55,172,`Original ribbon: ${c}/${d} m`);
      out+=label(55,210,`Use ${a}/${b} of the original ribbon`);
      if(overlap) {
        for(let part=0;part<b;part++)out+=`<rect x="${x+part*known/b}" y="250" width="${known/b}" height="${h}" class="${part<a?'os-selected':'os-ribbon-given'}" data-ribbon-share="" data-used="${part<a}"/>`;
        out+=`<path d="M${x+known} 250 H${x+w} V306 H${x+known}" class="os-divider"/>`;
        out+=label(55,346,`Used length: ${a*c}/${b*d} m`);
      }
      return svg(out,overlap?378:240);
    }
    const x=85,y=70,w=tank?220:430,h=tank?200:215;
    const rows=partition?(tank?d:b):tank?d:1,cols=partition?(tank?b:d):tank?1:d;
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++) {
      const base=tank?row>=d-c:col<c,selected=base&&['overlap','numerator','denominator'].includes(phase)&&(tank?col<a:row<a);
      out+=`<rect x="${x+col*w/cols}" y="${y+row*h/rows}" width="${w/cols}" height="${h/rows}" class="${selected?'os-selected':base?'os-water':'os-empty'}" data-product-cell="" data-base-selected="${base}" data-product-selected="${selected}"/>`;
    }
    if(tank)out+=`<path d="M${x-5} ${y-6} V${y+h+5} H${x+w+5} V${y-6}" class="os-capacity-outline"/>`;
    if(m.object==='flour')out+=`<path d="M${x+35} ${y-18} H${x+w-35} L${x+w+10} ${y+8} V${y+h+12} H${x-10} V${y+8} Z" class="os-capacity-outline"/>`;
    if(tank) {
      out+=label(330,112,`${c}/${d} full`)+label(330,165,`${m.action_label||'Use'} ${a}/${b}`)+label(330,198,m.contents_label||'of this water','os-small');
    } else {
      out+=label(85,325,`${c}/${d} of the whole is shaded.`);
      if(phase!=='columns')out+=label(85,361,`Take ${a}/${b} of the shaded part.`);
    }
    const baseY=tank?316:405;
    if(overlap)out+=label(32,baseY,`${a*c} selected parts out of ${b*d}`)+label(32,baseY+38,`Exact product: ${a*c}/${b*d}`);
    else if(phase==='numerator')out+=label(32,baseY,`Selected-part count: ${a} × ${c} = ${a*c}`);
    else if(phase==='denominator')out+=label(32,baseY,`All equal parts: ${b} × ${d} = ${b*d}`);
    else if(phase==='partition')out+=label(32,baseY,`${b} rows × ${d} columns`);
    return svg(out,baseY+(overlap?68:phase==='question'||phase==='columns'?0:35));
  }
  function cancelProduct(m,reveal,shown=1) {
    if(!reveal&&!m.cancel_step&&['ribbon','container','card'].includes(m.object))return fractionProduct(m,false);
    const steps=m.cancel_steps||[],index=m.cancel_step?m.cancel_step-1:reveal?Math.min(shown,steps.length)-1:-1;
    const showProduct=m.show_product||(reveal&&shown>=(m.working_product_at||steps.length+3));
    const values={a:m.a,b:m.b,c:m.c,d:m.d};
    for(let i=0;i<index;i++){const step=steps[i];values[step.first]/=step.divisor;values[step.second]/=step.divisor;}
    const largeFraction=(x,y,n,d)=>label(x,y-14,n,'os-cancel-number os-middle')+`<path d="M${x-24} ${y} h48" class="os-bracket"/>`+label(x,y+34,d,'os-cancel-number os-middle');
    const row=(v,y)=>largeFraction(180,y,v.a,v.b)+label(300,y+9,'×','os-cancel-number os-middle')+largeFraction(420,y,v.c,v.d);
    let out=label(32,30,reveal?'One valid route to compare':'Fraction multiplication')+row(values,105);
    if(index<0){if(showProduct){const p=window.RevilyValidators.parseRational(`${m.a*m.c}/${m.b*m.d}`);out+=label(120,211,'Simplest product:')+largeFraction(375,200,String(p.n),String(p.d));}return svg(out,showProduct?258:160);}
    const step=steps[index],coords={a:[180,86],b:[180,126],c:[420,86],d:[420,126]},[x1,y1]=coords[step.first],[x2,y2]=coords[step.second];
    out+=`<path d="M${x1+22} ${y1} Q300 ${y1<y2?25:185} ${x2-22} ${y2}" class="os-cancel-link" data-cancel-pair="${step.first}-${step.second}"/>`;
    out+=label(300,210,`Divide both by ${step.divisor}`,'os-middle');
    if(reveal||m.show_replacements) {
      values[step.first]/=step.divisor;values[step.second]/=step.divisor;
      out+=row(values,275)+label(300,337,'Replacement values; unchanged product','os-small os-middle');
    }
    if(showProduct) {
      const result=window.RevilyValidators.parseRational(`${m.a*m.c}/${m.b*m.d}`);
      out+=label(120,398,'Simplest product:')+largeFraction(375,390,String(result.n),String(result.d))+(m.unit?label(410,401,m.unit):'');
    }
    return svg(out,showProduct?440:reveal||m.show_replacements?365:235);
  }
  function simplifyProduct(m,reveal) {
    const n=m.a*m.c,d=m.b*m.d;
    let x=n,y=d;while(y)[x,y]=[y,x%y];const factor=m.divisor||x;
    if(!Number.isInteger(factor)||factor<=1||n%factor||d%factor)throw new Error('Simplification model needs a common factor of both product counts.');
    const phase=reveal?(m.resultScope||'simplified'):m.phase||'question';
    if(phase==='question')return fractionProduct(m,false);
    if(['numerator','denominator'].includes(phase))return fractionProduct({...m,phase},false);
    const bar=(top,parts,selected,groupSize=0)=>{
      let html='';for(let i=0;i<parts;i++)html+=`<rect x="${50+i*500/parts}" y="${top}" width="${500/parts}" height="52" class="${i<selected?'os-selected':'os-empty'}" data-simplify-cell="" data-simplify-selected="${i<selected}"/>`;
      if(groupSize)for(let i=0;i<=parts;i+=groupSize)html+=`<path d="M${50+i*500/parts} ${top-7} v66" class="os-capacity-outline" data-simplify-boundary=""/>`;
      return html;
    };
    const simpleN=n/factor,simpleD=d/factor;
    let out=label(32,30,m.object==='tank'?'Used fraction of full tank capacity':m.object==='flour'?'Used fraction of a full flour bag':m.object==='card'?'Card area as a fraction of 1 m²':'Same reference whole throughout');
    out+=bar(75,d,n,phase==='grouped'?factor:0);
    out+=label(50,167,`Product before simplifying: ${n}/${d}`);
    if(phase==='grouped')out+=label(50,208,`Regroup both counts in groups of ${factor}.`);
    if(phase==='factor')out+=label(50,208,'Your common factor divides both counts.');
    if(phase==='simplified') {
      out+=bar(240,simpleD,simpleN);
      out+=label(50,326,`${n} ÷ ${factor} = ${simpleN}; ${d} ÷ ${factor} = ${simpleD}`);
      out+=label(50,368,`Simplest form: ${simpleN}/${simpleD}${m.unit?' '+m.unit:''}`);
      out+=label(50,407,'The selected amount has not changed.','os-small');
    }
    return svg(out,phase==='simplified'?437:phase==='raw'?195:240);
  }
  function wholeFactor(m,reveal) {
    let out=label(32,30,`${m.copies} whole units`);
    for(let i=0;i<m.copies;i++)out+=`<rect x="${32+i*536/m.copies}" y="60" width="${536/m.copies-8}" height="60" rx="5" class="os-selected"/>`;
    out+=label(180,175,`${m.copies} =`);out+=fractionLabel(277,171,reveal?m.copies:'?',reveal?1:'?');
    return svg(out,225);
  }
  function wholeMultiple(m,reveal) {
    if(!Number.isInteger(m.n)||!Number.isInteger(m.d)||!Number.isInteger(m.copies)||m.n<1||m.n>=m.d||m.copies<1)throw new Error('Fraction-by-whole visual requires an authored proper fraction and whole-number multiplier.');
    const phase=reveal?(m.resultScope||'combined'):m.phase||'question',combined=phase==='combined';
    const product=m.n*m.copies,reference=m.assessment?'Reference bar':m.unit?`Reference whole: 1 ${m.unit}`:'Each full bar is the same whole';
    const bar=(y,selected,klass='os-selected')=>{
      let html='';for(let j=0;j<m.d;j++)html+=`<rect x="${100+j*450/m.d}" y="${y}" width="${450/m.d}" height="32" class="${j<selected?klass:'os-empty'}" data-unit-piece="" data-selected-piece="${j<selected}"/>`;return html;
    };
    let out=label(32,28,reference),cursor=65;
    if(['rice','flour'].includes(m.object)) {
      for(let i=0;i<m.copies;i++)out+=vessel(105+i*82,cursor,m.object,.65);
      out+=label(32,cursor+95,`${m.copies} ${m.object==='rice'?'packets':'batches'}; ${m.n}/${m.d} kg each`);cursor+=125;
    } else if(m.object==='running') {
      out+='<ellipse cx="185" cy="103" rx="88" ry="37" class="os-empty"/><ellipse cx="185" cy="103" rx="70" ry="23" class="os-empty"/>';
      out+=label(320,88,`${m.copies} laps`)+label(320,128,`${m.n}/${m.d} km per lap`);cursor=185;
    } else if(m.object==='rods') {
      out+=`<rect x="100" y="75" width="${450*m.n/m.d}" height="18" rx="3" class="os-wire"/>`;
      out+=label(32,133,`${m.copies} rods; each rod ${m.n}/${m.d} m`);cursor=165;
    }
    if(combined) {
      for(let w=0;w<Math.ceil(product/m.d);w++) {out+=bar(cursor,Math.min(m.d,product-w*m.d));cursor+=52;}
      out+=fractionLabel(63,cursor-28,product,m.d);
      out+=label(100,cursor+17,`Total: ${product}/${m.d}${m.unit?' '+m.unit:''}`);
      out+=label(32,cursor+58,`The part size is still 1/${m.d}.`,'os-small');cursor+=83;
    } else {
      const groups=phase==='groups'?m.copies:1;
      for(let group=0;group<groups;group++){out+=fractionLabel(62,cursor+13,m.n,m.d)+bar(cursor,m.n);cursor+=56;}
      out+=label(100,cursor+12,phase==='groups'?`${m.copies} equal groups`:`Number of groups: ${m.copies}`);
      if(phase==='numerator')out+=label(100,cursor+51,`Number of parts: ${product}`);
      if(phase==='denominator')out+=label(100,cursor+51,`Denominator: ${m.d} × 1 = ${m.d}`);
      cursor+=phase==='numerator'||phase==='denominator'?82:43;
    }
    return svg(out,cursor);
  }
  function vessel(x,y,object,scale=1) {
    const shape = object === 'bottle'
      ? '<path d="M15 0 h20 v10 l10 12 v61 q0 7 -7 7 H12 q-7 0 -7 -7 V22 l10 -12 Z"/><path d="M8 45 H42 V82 H8Z" class="os-water"/>'
      : '<path d="M9 0 h32 l-5 12 q19 24 10 66 q-2 12 -12 12 H16 Q6 90 4 78 Q-5 37 14 12 Z"/><path d="M13 16 H37" class="os-bracket"/>';
    return `<g transform="translate(${x} ${y}) scale(${scale})" class="os-vessel">${shape}</g>`;
  }
  function portions(m,reveal) {
    const bottle = m.object === 'bottle';
    const noun = bottle ? 'bottle' : m.object === 'flour' ? 'batch' : 'portion';
    let out = label(50,29,`Available ${bottle ? 'juice' : m.object}: ${m.total} ${m.unit}`);
    if(reveal) {
      const count = resultFor(m), columns=Math.min(count,8);
      for(let i=0;i<count;i++) out += vessel(50+(i%columns)*62,58+Math.floor(i/columns)*105,m.object,.67);
      out += label(50,Math.ceil(count/8)*105+70,`Each ${noun}: ${m.n}/${m.d} ${m.unit}`);
      return svg(out,Math.ceil(count/8)*105+102);
    }
    out += vessel(72,64,m.object,1.2);
    out += label(220,100,`One ${noun}: ${m.n}/${m.d} ${m.unit}`);
    out += label(220,151,`Number of ${noun === 'batch' ? 'batches' : noun+'s'}: ?`);
    return svg(out,230);
  }
  function unitAmount(m,reveal) {
    const total=number(m.total), per=total/m.d;
    if(!Number.isInteger(total) || !Number.isInteger(per) || !Number.isInteger(m.n) || m.n<1 || m.n>=m.d || m.d<2 || (m.kind==='unit_fraction_amount'&&m.n!==1)) throw new Error('Fraction amount requires an integer whole shared into equal integer groups and a proper fraction.');
    const phase=reveal?(m.resultScope==='unit'?'unit':'selected'):m.phase||'question';
    const selectedCount=phase==='unit'?1:phase==='selected'?m.n:0;
    const grouped=['grouped','unit','selected'].includes(phase) && !m.hidePartition;
    const suffix=m.unit?` ${m.unit}`:'';
    const formatted=value=>m.unit==='£'?`£${value}`:`${value}${suffix}`;
    let out=label(32,30,`${m.object==='money'?'Money available':m.object==='ribbon'?'Full ribbon':m.object==='journey'?'Full journey':m.object==='students'?'Year group':'Whole amount'}: ${formatted(m.total)}`);
    if(m.object==='counters'||m.object==='tiles') {
      const groups=grouped?m.d:1, cols=grouped?Math.min(m.d,6):1;
      const count=grouped?per:total, dotCols=grouped?Math.ceil(Math.sqrt(count)):Math.min(count,12);
      const groupW=536/cols, rows=Math.ceil(groups/cols), boxH=Math.max(84,24+Math.ceil(count/dotCols)*20), groupH=boxH+16;
      for(let g=0;g<groups;g++) {
        const x=32+(g%cols)*groupW, y=53+Math.floor(g/cols)*groupH;
        out+=`<rect x="${x}" y="${y}" width="${groupW-8}" height="${boxH}" rx="9" class="${g<selectedCount?'os-selected':'os-empty'}"/>`;
        for(let j=0;j<count;j++) {
          const cx=x+16+(j%dotCols)*(groupW-40)/Math.max(1,dotCols-1),cy=y+20+Math.floor(j/dotCols)*20;
          const color=g<selectedCount&&m.selectionColor==='red'?' os-red-counter':g<selectedCount&&m.selectionColor==='blue'?' os-blue-tile':'';
          out+=m.object==='tiles'?`<rect x="${cx-5}" y="${cy-5}" width="10" height="10" class="os-dot${color}" data-tile=""/>`:`<circle cx="${cx}" cy="${cy}" r="6" class="os-dot${color}" data-counter=""/>`;
        }
      }
      out+=label(32,rows*groupH+75,phase==='selected'||phase==='unit'?(selectedCount===1?`One group contains ${per}.`:`${selectedCount} groups contain ${per*selectedCount}.`):grouped?`${m.d} equal groups; ${total} ${m.object} altogether.`:`Requested fraction: ${m.n}/${m.d}`);
      return svg(out,rows*groupH+100);
    }
    const count=grouped?m.d:1, w=536/count;
    for(let i=0;i<count;i++) {
      out+=`<rect x="${32+i*w}" y="70" width="${w}" height="64" class="${i<selectedCount?'os-selected':'os-empty'}"/>`;
      if(phase==='selected'||phase==='unit') out+=label(32+(i+.5)*w,109,per,'os-middle');
    }
    out+=label(32,178,phase==='selected'||phase==='unit'?(selectedCount===1?`One share: ${formatted(per)}`:`${selectedCount} shares: ${formatted(per*selectedCount)}`):grouped?`${m.d} equal shares`:`Requested fraction: ${m.n}/${m.d}`);
    return svg(out,205);
  }
  function accessibleDescription(visual,ctx={}) {
    const m = modelFor(visual,ctx);
    if(!m) throw new Error('Operation visual requires an explicit authored model.');
    if(m.kind==='place_value_conversion')return window.RevilyPlaceValue.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='percent_hundred')return window.RevilyPercentHundred.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='benchmark_equivalence')return window.RevilyBenchmark.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='decimal_scaling')return window.RevilyDecimalScaling.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='mixed_fdp')return window.RevilyMixedFDP.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='percentage_change_structure')return window.RevilyPercentageChangeStructure.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='mixed_percentage_questions')return window.RevilyMixedPercentage.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='percentage_comparison')return window.RevilyPercentageComparison.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='measured_percentage_amount')return window.RevilyMeasuredPercentageAmount.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='money_percentage_amount')return window.RevilyMoneyPercentageAmount.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='method_choice_amount')return window.RevilyMethodChoiceAmount.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='decimal_multiplier_amount')return window.RevilyDecimalMultiplierAmount.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='one_percent_amount')return window.RevilyOnePercentAmount.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='percentage_fraction_amount')return window.RevilyPercentageFractionAmount.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='fdp_ordering')return window.RevilyFDPOrdering.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='fdp_comparison')return window.RevilyFDPComparison.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='percent_fraction_conversion')return window.RevilyPercentFraction.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='decimal_percent_conversion')return window.RevilyDecimalPercent.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='equivalent_percent_conversion')return window.RevilyEquivalentPercent.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='division_decimal_conversion')return window.RevilyDivisionDecimal.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='equivalent_decimal_conversion')return window.RevilyEquivalentDecimal.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='power_ten_decimal')return window.RevilyPowerTenDecimal.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='decimal_fraction_conversion')return window.RevilyDecimalFraction.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(['capstone_method','capstone_problem'].includes(m.kind))return window.RevilyCapstoneFractionVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='additive_timeline')return window.RevilyAdditiveTimeline.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(['fraction_situation','fraction_situation_rule'].includes(m.kind))return window.RevilyFractionSituation.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(['mixed_subtract_no_exchange','mixed_subtract_exchange'].includes(m.kind))return window.RevilyMixedSubtraction.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(['mixed_add_no_regroup','mixed_add_regroup'].includes(m.kind))return window.RevilyMixedAddition.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='mixed_conversion')return window.RevilyMixedConversion.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='simplify_after_operation')return window.RevilySimplifyOperationVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(m.kind==='lcd_rule')return disclosed(m,ctx)?'A common denominator is a multiple of both denominators. The lowest is the first positive common multiple.':'Consider the two conditions in the phrase lowest common denominator. Their definitions are not shown.';
    if(m.kind==='lowest_common_denominator') {
      if(m.mode==='missing_multiple')return `Multiples of ${m.list_base}: ${m.values.map((value,index)=>value===null?(disclosed(m,ctx)?(index+1)*m.list_base:'missing value'):value).join(', ')}.`+(disclosed(m,ctx)?' The missing multiple is completed.':' The missing value is not shown.');
      const answer=m.a*m.b/gcdInt(m.a,m.b),base=`The denominators are ${m.a} and ${m.b}.`+(m.expression?` The later calculation is ${m.expression}; only its lowest common denominator is required.`:'')+(m.mode==='candidate'?` The candidate is ${m.candidate}.`:'');
      const lists=m.mode==='lists'&&m.lists?` Multiples of ${m.a}: ${m.lists[0].join(', ')}. Multiples of ${m.b}: ${m.lists[1].join(', ')}.`:'';
      return base+lists+(disclosed(m,ctx)?` The first positive common multiple is ${answer}; this is the lowest common denominator.`:' The lowest common denominator is not shown.');
    }
    if(m.kind==='both_denominators_subtract') {
      const common=m.b*m.d/gcdInt(m.b,m.d),first=m.a*(common/m.b),second=m.c*(common/m.d),count=m.solved?4:disclosed(m,ctx)?ctx.workingRevealed||1:0;
      const base=m.object==='ribbon'?`Ribbon length ${m.a} over ${m.b} metre; a length of ${m.c} over ${m.d} metre is cut off.`:m.object==='tank'?`The tank is ${m.a} over ${m.b} full; water equal to ${m.c} over ${m.d} of full capacity is removed.`:m.object==='walk'?`The route is ${m.a} over ${m.b} kilometre long. Hassan has walked ${m.c} over ${m.d} kilometre, not that fraction of the route.`:m.object==='paint'?`The container holds ${m.a} over ${m.b} litre of paint; the decorator uses ${m.c} over ${m.d} litre.`:`Subtract ${m.c} over ${m.d} from ${m.a} over ${m.b}, preserving that order.`;
      if(m.object==='paint')return base+(disclosed(m,ctx)?' Take the used volume from the starting volume using subtraction.':' The operation is not shown.');
      return base+(count>=1?` Common denominator ${common}.`:'')+(count>=2?` The first fraction becomes ${first} over ${common}.`:'')+(count>=3?` The second fraction becomes ${second} over ${common}.`:'')+(count>=4?` Remove ${second} parts from ${first}; ${first-second} parts out of ${common} remain.`:' The remaining amount is not shown.');
    }
    if(m.kind==='both_denominators_add') {
      const common=m.b*m.d/gcdInt(m.b,m.d),first=m.a*(common/m.b),second=m.c*(common/m.d),count=m.solved?4:disclosed(m,ctx)?ctx.workingRevealed||1:0;
      const base=m.object==='jug'?`A jug contains ${m.a} over ${m.b} litre of water; a further ${m.c} over ${m.d} litre is added.`:m.object==='journey'?`Aisha completes ${m.a} over ${m.b} of a journey before lunch and ${m.c} over ${m.d} after lunch.`:m.object==='ribbon'?`Red ribbon is ${m.a} over ${m.b} metre long; blue ribbon is ${m.c} over ${m.d} metre long.`:m.object==='paint'?`Red paint volume ${m.a} over ${m.b} litre; white paint volume ${m.c} over ${m.d} litre.`:`Add ${m.a} over ${m.b} and ${m.c} over ${m.d}.`;
      if(m.object==='paint')return base+(disclosed(m,ctx)?' Combine the volumes using addition.':' The operation is not shown.');
      return base+(count>=1?` Common denominator ${common}.`:'')+(count>=2?` First fraction becomes ${first} over ${common}.`:'')+(count>=3?` Second fraction becomes ${second} over ${common}.`:'')+(count>=4?` Sum ${first+second} over ${common}.`:' The sum is not shown.');
    }
    if(m.kind==='one_multiple_subtract') {
      const common=Math.max(m.b,m.d),first=m.a*(common/m.b),second=m.c*(common/m.d),difference=first-second;
      const context=m.object==='bottle'?`A bottle contains ${m.a} over ${m.b} litre of water; Hana pours out ${m.c} over ${m.d} litre.`:m.object==='ribbon'?`A ribbon is ${m.a} over ${m.b} metre long; ${m.c} over ${m.d} metre is cut off.`:m.object==='tank'?`A tank is ${m.a} over ${m.b} full; water equal to ${m.c} over ${m.d} of full capacity is removed.`:m.object==='rice'?`A bag contains ${m.a} over ${m.b} kilogram of rice; the chef uses ${m.c} over ${m.d} kilogram.`:`Subtract ${m.c} over ${m.d} from ${m.a} over ${m.b}, preserving that order.`;
      if(m.object==='rice')return context+(disclosed(m,ctx)?` The calculation is ${m.a} over ${m.b} minus ${m.c} over ${m.d}.`:' The operation and remaining mass are not shown.');
      return context+(disclosed(m,ctx)?` With denominator ${common}, take ${second} parts from ${first} parts. The remaining amount is ${difference} over ${common}.`:' The common-denominator form and remaining amount are not shown.');
    }
    if(m.kind==='one_multiple_add') {
      const common=Math.max(m.b,m.d),first=m.a*(common/m.b),second=m.c*(common/m.d),sum=first+second;
      const context=m.object==='jug'?'Jug with separate amounts of orange juice and water. ':m.object==='journey'?'Morning and afternoon portions of one journey. ':m.object==='tank'?'Starting water and added water relative to one full tank. ':m.object==='beads'?'Separate masses of red and blue beads. ':'';
      return `${context}Add ${m.a} over ${m.b} and ${m.c} over ${m.d}. One denominator is a multiple of the other.`+(disclosed(m,ctx)?` With denominator ${common}, the fractions are ${first} over ${common} and ${second} over ${common}; the sum is ${sum} over ${common}.`:' The common-denominator form and sum are not shown.');
    }
    if(m.kind==='equivalent_fraction') {
      const context=m.object==='class'?`A class of ${m.target_d} students with ${m.n} over ${m.d} travelling by bus. `:m.object==='tank'?`A tank scale with ${m.target_d} equal intervals and a level of ${m.n} over ${m.d}. `:m.object==='survey'?`A survey of ${m.target_d} people with ${m.n} over ${m.d} choosing option A. `:m.object==='diagram'?`${m.n} of ${m.d} equal diagram parts are shaded. `:`A bar shows the known fraction ${m.n} over ${m.d}. `;
      if(disclosed(m,ctx))return context+`The equal target fraction is ${m.target_n} over ${m.target_d}.`;
      if(m.missing==='numerator')return context+`The target denominator is ${m.target_d}; the missing numerator and target shading are not shown.`;
      if(m.missing==='denominator')return context+`The target numerator is ${m.target_n}; the missing denominator and full partition are not shown.`;
      return context+'The equivalent choice and target model are not shown.';
    }
    if(m.kind==='simplify_fraction'){const g=gcdInt(m.n,m.d),sn=m.n/g,sd=m.d/g,context=m.object&&m.object!=='bars'?`${m.object} context with ${m.n} selected items and ${m.d-m.n} other items. `:'';return `${context}Original fraction ${m.n} over ${m.d}.`+(disclosed(m,ctx)?g===1?` It is already in simplest form because there is no common factor greater than one.`:` Divide both counts by ${g}; the equivalent simplest fraction is ${sn} over ${sd}.`:' The simplest form is not shown.');}
    if(m.kind==='same_denominator_subtract')return `${m.object}. Starting amount ${m.a} over ${m.d}; amount removed ${m.b} over ${m.d}. Both quantities use the same reference whole and equal-part size.`+(disclosed(m,ctx)?` Remaining amount ${m.a-m.b} over ${m.d}.`:' The remaining amount is not shown.');
    if(m.kind==='same_denominator_add')return `${m.object}. First amount ${m.a} over ${m.d}; second amount ${m.b} over ${m.d}. All parts use the same unchanged whole and part size.`+(disclosed(m,ctx)?` Combined amount ${m.a+m.b} over ${m.d}.`:' The combined amount is not shown.');
    if(m.kind==='mixed_method_map')return 'Four different relationships are compared: known whole to part, known part to whole, product of quantities, and total to group count. The relationship, not the visible fraction, determines the method.';
    if(m.kind==='guided_equation')return `${m.label}. ${m.expression}.`+(disclosed(m,ctx)?` Completed line: ${m.completed}.`:m.response_kind==='explanation'?' The explanation is not shown.':' The missing value is not shown.');
    if(['fraction_groups','fraction_groups_rule'].includes(m.kind))return window.RevilyFractionGroupVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed,ctx.feedback);
    if(['proper_groups','proper_groups_rule'].includes(m.kind))return window.RevilyProperGroupVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed,ctx.feedback);
    if(['unit_groups','unit_groups_rule'].includes(m.kind))return window.RevilyUnitGroupVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed,ctx.feedback);
    if(['fraction_share','fraction_share_rule'].includes(m.kind))return window.RevilyFractionShareVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed,ctx.feedback);
    if(['reciprocal','reciprocal_rule','reciprocal_zero'].includes(m.kind))return window.RevilyReciprocalVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed,ctx.feedback);
    if(m.kind==='mixed_product')return window.RevilyMixedProductVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed);
    if(['mixed_division','mixed_division_rule'].includes(m.kind))return window.RevilyMixedDivisionVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed,ctx.feedback);
    if(['multi_step','multi_step_rule'].includes(m.kind))return window.RevilyMultiStepVisuals.accessible(m,disclosed(m,ctx),ctx.workingRevealed,ctx.feedback);
    if(m.kind==='mixed_product_rule')return 'Choose how a mixed number is used in fraction multiplication.';
    if(m.kind==='cancel_product_rule')return 'Choose a valid explanation of cancellation in a fraction product.';
    if(m.kind==='cancel_product') {
      if(!disclosed(m,ctx)&&!m.cancel_step&&m.object!=='symbolic')return m.object==='ribbon'?`Ribbon length ${m.c} over ${m.d} metre; ${m.a} over ${m.b} of the ribbon is used. The used length is not shown.`:m.object==='container'?`Container ${m.c} over ${m.d} full; ${m.a} over ${m.b} of its contents is removed. The fraction of full capacity removed is not shown.`:`Notice width ${m.a} over ${m.b} metre and height ${m.c} over ${m.d} metre. Its area is not shown.`;
      const steps=m.cancel_steps||[],count=m.cancel_step||Math.min(ctx.workingRevealed||1,steps.length),values={a:m.a,b:m.b,c:m.c,d:m.d};
      let description=`${m.a} over ${m.b} multiplied by ${m.c} over ${m.d}.`;
      if(!disclosed(m,ctx)&&!m.cancel_step)return description+' The product and cancellation are not shown.';
      const names={a:'left numerator',b:'left denominator',c:'right numerator',d:'right denominator'};
      for(let i=0;i<count;i++){const step=steps[i];description+=` Divide ${names[step.first]} and ${names[step.second]} by ${step.divisor}.`;values[step.first]/=step.divisor;values[step.second]/=step.divisor;}
      if(disclosed(m,ctx)||m.show_replacements)description+=` Replacements give ${values.a} over ${values.b} multiplied by ${values.c} over ${values.d}.`;
      if(m.show_product||(disclosed(m,ctx)&&(ctx.workingRevealed||1)>=(m.working_product_at||steps.length+3))){const result=window.RevilyValidators.parseRational(`${m.a*m.c}/${m.b*m.d}`);description+=` Simplest product ${result.n} over ${result.d}${m.unit?' '+m.unit:''}.`;}
      return description;
    }
    if(m.kind==='unit_fraction_rule') return 'Choose the statement about finding one equal share of an amount.';
    if(m.kind==='fraction_amount_rule') return 'Choose the method for finding a non-unit fraction of an amount.';
    if(m.kind==='rebuild_amount_rule') return 'Choose the method for finding an unknown whole from a known fractional part.';
    if(m.kind==='whole_multiple_rule')return 'Choose how a proper fraction is multiplied by a whole number.';
    if(m.kind==='fraction_product_rule')return 'Choose the method for multiplying two proper fractions.';
    if(m.kind==='simplify_product_rule')return 'Choose the method for writing a fraction product in simplest form.';
    if(m.kind==='equivalence_rule')return 'Consider what happens when both parts of a fraction are divided by a common factor.';
    if(m.kind==='simplify_product') {
      const phase=disclosed(m,ctx)?m.resultScope||'simplified':m.phase||'question',n=m.a*m.c,d=m.b*m.d;
      const raw=m.object==='tank'?`Tank initially ${m.c} over ${m.d} full; ${m.a} over ${m.b} of its water is used. The reference is full capacity.`:m.object==='flour'?`Available flour is ${m.c} over ${m.d} of a full bag; one batch uses ${m.a} over ${m.b} of that flour.`:m.object==='card'?`Card length ${m.a} over ${m.b} metre and width ${m.c} over ${m.d} metre. The requested area is in square metres.`:`${m.object}. Product of ${m.a} over ${m.b} and ${m.c} over ${m.d}.`;
      if(phase==='question')return raw+' The requested answer is not shown.';
      if(phase==='numerator')return raw+` Numerator product: ${n}.`;
      if(phase==='denominator')return raw+` Denominator product: ${d}.`;
      const p=window.RevilyValidators.parseRational(`${n}/${d}`);
      return raw+` Unsimplified product: ${n} over ${d}.`+(phase==='simplified'?` Same amount, simplest form: ${p.n} over ${p.d}${m.unit?' '+m.unit:''}.`:phase==='factor'?' The chosen factor divides both counts. The simplified result is not shown.':' The simplified result is not shown.');
    }
    if(m.kind==='fraction_product') {
      const phase=disclosed(m,ctx)?m.resultScope||'overlap':m.phase||'question';
      return `${m.object}. The reference is ${m.object==='ribbon'?'one metre':m.object==='tank'||m.object==='container'?'the full capacity':'one whole'}. Take ${m.a} over ${m.b} of ${m.c} over ${m.d}.`+(phase==='overlap'?` Selected result: ${m.a*m.c} over ${m.b*m.d}${m.unit?' '+m.unit:''}.`:phase==='numerator'?` Selected-part count: ${m.a*m.c}.`:phase==='denominator'?` Total equal parts: ${m.b*m.d}.`:' The requested product is not shown.');
    }
    if(m.kind==='whole_factor')return `${m.copies} whole units.`+(disclosed(m,ctx)?` Written as a fraction: ${m.copies} over one.`:' The fraction representation is not shown.');
    if(m.kind==='whole_multiple') {
      const phase=disclosed(m,ctx)?m.resultScope||'combined':m.phase||'question';
      return `${m.object}. ${m.copies} groups of ${m.n} over ${m.d}${m.unit?' '+m.unit:''}.`+(phase==='combined'?` Exact total: ${m.n*m.copies} over ${m.d}${m.unit?' '+m.unit:''}.`:phase==='numerator'?` The combined number of parts is ${m.n*m.copies}.`:phase==='denominator'?` The denominator remains ${m.d}.`:' The combined result is not shown.');
    }
    if(m.kind==='rebuild_amount') {
      const phase=disclosed(m,ctx)?(m.resultScope==='unit'?'unit':'whole'):m.phase||'given';
      return `${m.object}. ${m.n} over ${m.d} of an unknown whole is ${m.known} ${m.unit||''}.`+(phase==='whole'?` The rebuilt whole is ${number(m.known)*m.d/m.n}.`:phase==='unit'?` One equal part has value ${number(m.known)/m.n}. The whole is not yet shown.`:' The given value is only the known part; the whole is not shown.');
    }
    if(m.kind==='fraction_amount') return `${m.object}. Whole amount ${m.total} ${m.unit||''}. Requested fraction ${m.n} over ${m.d}.`+(disclosed(m,ctx)?` ${m.resultScope==='unit'?'One equal share':'Selected amount'} has value ${resultFor(m)}.`:m.phase==='unit'?` One equal share has value ${number(m.total)/m.d}; the requested fraction is not yet calculated.`:' The requested result is not shown.');
    if(m.kind==='unit_fraction_amount') return `${m.object}. Whole amount ${m.total} ${m.unit||''}. Requested fraction one over ${m.d}.`+(disclosed(m,ctx)?` One equal share has value ${resultFor(m)}.`:' The requested result is not shown.');
    if(m.kind === 'decision') return m.assessment ? 'Consider what is known and what the question asks you to find.' : 'Three relationships: find a fraction of a known quantity; count fraction-sized groups; rebuild a whole from a known part.';
    const given = m.kind === 'whole' ? `${m.n}/${m.d} of an unknown whole is ${m.known}.` : `${m.object}. Known total ${m.total} ${m.unit||''}. ${m.kind === 'groups' ? 'One group has size' : 'The requested fraction is'} ${m.n}/${m.d} ${m.kind === 'groups' ? m.unit||'' : ''}.`;
    const answer = ctx.question?.response?.type === 'exact_number' ? ctx.question.answer.value : m.result || resultFor(m);
    return given + (disclosed(m,ctx) ? ` ${m.solved ? 'Worked example' : 'After submission'}: ${m.target || 'Result'} = ${answer}.` : ' The requested answer is not shown.');
  }
  function renderMarkup(visual,ctx={}) {
    const m = modelFor(visual,ctx);
    if(!m) throw new Error('Operation visual requires an explicit authored model.');
    const reveal=disclosed(m,ctx);
    let art;
    if(m.kind==='place_value_conversion')art=window.RevilyPlaceValue.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='percent_hundred')art=window.RevilyPercentHundred.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='benchmark_equivalence')art=window.RevilyBenchmark.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='decimal_scaling')art=window.RevilyDecimalScaling.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='mixed_fdp')art=window.RevilyMixedFDP.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='percentage_change_structure')art=window.RevilyPercentageChangeStructure.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='mixed_percentage_questions')art=window.RevilyMixedPercentage.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='percentage_comparison')art=window.RevilyPercentageComparison.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='measured_percentage_amount')art=window.RevilyMeasuredPercentageAmount.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='money_percentage_amount')art=window.RevilyMoneyPercentageAmount.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='method_choice_amount')art=window.RevilyMethodChoiceAmount.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='decimal_multiplier_amount')art=window.RevilyDecimalMultiplierAmount.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='one_percent_amount')art=window.RevilyOnePercentAmount.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='percentage_fraction_amount')art=window.RevilyPercentageFractionAmount.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='fdp_ordering')art=window.RevilyFDPOrdering.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='fdp_comparison')art=window.RevilyFDPComparison.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='percent_fraction_conversion')art=window.RevilyPercentFraction.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='decimal_percent_conversion')art=window.RevilyDecimalPercent.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='equivalent_percent_conversion')art=window.RevilyEquivalentPercent.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='division_decimal_conversion')art=window.RevilyDivisionDecimal.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='equivalent_decimal_conversion')art=window.RevilyEquivalentDecimal.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='power_ten_decimal')art=window.RevilyPowerTenDecimal.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='decimal_fraction_conversion')art=window.RevilyDecimalFraction.render(m,reveal,ctx.workingRevealed);
    else if(['capstone_method','capstone_problem'].includes(m.kind))art=window.RevilyCapstoneFractionVisuals.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='additive_timeline')art=window.RevilyAdditiveTimeline.render(m,reveal,ctx.workingRevealed);
    else if(['fraction_situation','fraction_situation_rule'].includes(m.kind))art=window.RevilyFractionSituation.render(m,reveal,ctx.workingRevealed);
    else if(['mixed_subtract_no_exchange','mixed_subtract_exchange'].includes(m.kind))art=window.RevilyMixedSubtraction.render(m,reveal,ctx.workingRevealed);
    else if(['mixed_add_no_regroup','mixed_add_regroup'].includes(m.kind))art=window.RevilyMixedAddition.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='mixed_conversion')art=window.RevilyMixedConversion.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='simplify_after_operation')art=window.RevilySimplifyOperationVisuals.render(m,reveal,ctx.workingRevealed);
    else if(m.kind==='lowest_common_denominator')art=lowestCommonDenominator(m,reveal);
    else if(m.kind==='lcd_rule')art=`<div class="os-lcd-model"><h2>Two conditions to check</h2><div class="os-lcd-rule"><section><h3>Common</h3><p>${reveal?'A multiple of both denominators':'?'}</p></section><section><h3>Lowest</h3><p>${reveal?'The first positive shared value':'?'}</p></section></div></div>`;
    else if(m.kind==='both_denominators_subtract')art=bothDenominatorsSubtract(m,reveal,ctx.workingRevealed);
    else if(m.kind==='both_denominators_add')art=bothDenominatorsAdd(m,reveal,ctx.workingRevealed);
    else if(m.kind==='one_multiple_subtract')art=oneMultipleSubtract(m,reveal);
    else if(m.kind==='one_multiple_add')art=oneMultipleAdd(m,reveal);
    else if(m.kind==='equivalent_fraction')art=equivalentFraction(m,reveal);
    else if(m.kind==='simplify_fraction')art=simplifyFraction(m,reveal);
    else if(m.kind==='same_denominator_subtract')art=sameDenominatorSubtract(m,reveal);
    else if(m.kind==='same_denominator_add')art=sameDenominatorAdd(m,reveal);
    else if(m.kind==='mixed_method_map')art='<div class="os-decision"><article><span>Known whole → part</span><strong>3/5 of 40</strong><p>40 × 3/5</p></article><article><span>Known part → whole</span><strong>3/5 is 24</strong><p>24 ÷ 3 × 5</p></article><article><span>Product of quantities</span><strong>2/3 × 5/7</strong><p>(2 × 5)/(3 × 7)</p></article><article><span>Total → group count</span><strong>3/4 ÷ 2/5</strong><p>3/4 × 5/2</p></article></div>';
    else if(m.kind==='guided_equation')art=`<div class="os-decision-question"><p>${esc(m.label)}</p><span>↓</span><p>${window.RevilyVisuals.mathMarkup(reveal?m.completed:m.expression)}</p></div>`;
    else if(['fraction_groups','fraction_groups_rule'].includes(m.kind))art=window.RevilyFractionGroupVisuals.render(m,reveal,ctx.workingRevealed,ctx.feedback);
    else if(['proper_groups','proper_groups_rule'].includes(m.kind))art=window.RevilyProperGroupVisuals.render(m,reveal,ctx.workingRevealed,ctx.feedback);
    else if(['unit_groups','unit_groups_rule'].includes(m.kind))art=window.RevilyUnitGroupVisuals.render(m,reveal,ctx.workingRevealed,ctx.feedback);
    else if(['fraction_share','fraction_share_rule'].includes(m.kind))art=window.RevilyFractionShareVisuals.render(m,reveal,ctx.workingRevealed,ctx.feedback);
    else if(['reciprocal','reciprocal_rule','reciprocal_zero'].includes(m.kind))art=window.RevilyReciprocalVisuals.render(m,reveal,ctx.workingRevealed,ctx.feedback);
    else if(m.kind==='mixed_product')art=window.RevilyMixedProductVisuals.render(m,reveal,ctx.workingRevealed);
    else if(['mixed_division','mixed_division_rule'].includes(m.kind))art=window.RevilyMixedDivisionVisuals.render(m,reveal,ctx.workingRevealed,ctx.feedback);
    else if(['multi_step','multi_step_rule'].includes(m.kind))art=window.RevilyMultiStepVisuals.render(m,reveal,ctx.workingRevealed,ctx.feedback);
    else if(m.kind==='mixed_product_rule')art='<div class="os-decision-question"><p>A mixed number</p><span>↓</span><p>One complete value</p></div>';
    else if(m.kind==='cancel_product')art=cancelProduct(m,reveal,ctx.workingRevealed);
    else if(m.kind==='cancel_product_rule')art='<div class="os-decision-question"><p>Rewrite a fraction multiplication</p><span>↓</span><p>Keep the same product</p></div>';
    else if(m.kind==='simplify_product')art=simplifyProduct(m,reveal);
    else if(m.kind==='simplify_product_rule')art='<div class="os-decision-question"><p>An exact fraction product</p><span>↓</span><p>Its simplest form</p></div>';
    else if(m.kind==='equivalence_rule')art='<div class="os-decision-question"><p>Numerator and denominator</p><span>↓</span><p>Divide by a common factor</p></div>';
    else if(m.kind==='fraction_product')art=fractionProduct(m,reveal);
    else if(m.kind==='fraction_product_rule')art='<div class="os-decision-question"><p>A fraction of a fraction</p><span>↓</span><p>An exact part of the original whole</p></div>';
    else if(m.kind==='whole_multiple')art=wholeMultiple(m,reveal);
    else if(m.kind==='whole_factor')art=wholeFactor(m,reveal);
    else if(m.kind==='whole_multiple_rule')art='<div class="os-decision-question"><p>A fractional amount</p><span>↓</span><p>Several equal copies</p></div>';
    else if(m.kind==='rebuild_amount') art=inverseAmount(m,reveal);
    else if(m.kind==='rebuild_amount_rule') art='<div class="os-decision-question"><p>A known fractional part</p><span>↓</span><p>The unknown whole</p></div>';
    else if(m.kind==='unit_fraction_amount'||m.kind==='fraction_amount') art=unitAmount(m,reveal);
    else if(m.kind==='unit_fraction_rule') art='<div class="os-decision-question"><p>A whole amount</p><span>↓</span><p>One equal share</p></div>';
    else if(m.kind==='fraction_amount_rule') art='<div class="os-decision-question"><p>A whole amount</p><span>↓</span><p>Several equal shares</p></div>';
    else if(m.kind === 'decision') {
      art = m.assessment
        ? '<div class="os-decision-question"><p>What is known?</p><span>↓</span><p>What must be found?</p></div>'
        : '<div class="os-decision"><article><span>Known whole → part</span><strong>Multiply</strong><p>fraction × known total</p></article><article><span>Total → group count</span><strong>Divide</strong><p>total ÷ size of one group</p></article><article><span>Known part → whole</span><strong>Divide</strong><p>known part ÷ stated fraction</p></article></div>';
    } else if(m.kind === 'whole') art=rebuild(m,reveal);
    else if(m.kind === 'fraction_of') art=fractionOf(m,reveal);
    else if(['rice','flour','bottle'].includes(m.object)) art=portions(m,reveal);
    else art=strip(m,reveal);
    const working = ['correct','support','worked'].includes(ctx.feedback) && !(ctx.feedback==='correct' && ctx.question?.policy?.solutionPolicy==='checkpoint') ? ctx.question?.working || [] : [];
    const visible = Math.min(working.length,Math.max(1,ctx.workingRevealed||1));
    const written=value=>m.symbolic_math?window.RevilyPercentageChangeStructure.symbolicMath(value):(m.kind==='percent_fraction_conversion'||m.decimal_math)?window.RevilyPercentFraction.math(value):m.math_text?window.RevilyVisuals.mathMarkup(value):esc(value);
    let narrowFacts='';
    if(m.kind==='one_multiple_subtract') {
      const unit=m.object==='bottle'?' L':m.object==='ribbon'?' m':m.object==='rice'?' kg':'',common=Math.max(m.b,m.d),difference=m.a*(common/m.b)-m.c*(common/m.d);
      const firstLabel=m.object==='bottle'?'Water in bottle':m.object==='ribbon'?'Ribbon length':m.object==='tank'?'Tank initially full':m.object==='rice'?'Rice in bag':'Starting amount';
      const secondLabel=m.object==='bottle'?'Hana pours out':m.object==='ribbon'?'Length cut off':m.object==='tank'?'Capacity removed':m.object==='rice'?'Chef uses':'Amount removed';
      const outcome=m.object==='rice'?(reveal?`Calculation: ${m.a}/${m.b} − ${m.c}/${m.d}`:'Calculation: choose below'):`Remaining: ${reveal?`${difference}/${common}`:'?'}${unit}`;
      narrowFacts=`<div class="os-mobile-facts" aria-hidden="true"><p>${written(`${firstLabel}: ${m.a}/${m.b}${unit}`)}</p><p>${written(`${secondLabel}: ${m.c}/${m.d}${unit}`)}</p><p>${written(outcome)}</p></div>`;
    }
    return `<div class="os-visual" data-model-kind="${esc(m.kind)}" data-context="${esc(m.object)}" data-revealed="${reveal}"${m.compact_captions?' data-compact-captions="true"':''}>
      ${m.previous?`<p class="os-previous">${m.math_text?written(m.previous):esc(m.previous)}</p>`:''}${art}${narrowFacts}
      ${m.annotation?`<p class="os-annotation">${written(m.annotation)}</p>`:''}
      ${working.length ? `<section class="os-working" aria-label="Worked solution"><h2>Compare your working</h2><ol aria-live="polite">${working.slice(0,visible).map((line,index)=>`<li>${written(line)}${index===0&&ctx.firstStepAssisted?'<small class="os-assisted-step">Ryan showed this step</small>':''}</li>`).join('')}</ol>${visible<working.length?'<button type="button" class="secondary-button" data-os-next>Show next line</button>':''}</section>` : ''}
    </div>`;
  }
  function bind(container,visual,ctx={}) {
    const working = ctx.question?.working || [];
    let shown = Math.min(working.length,Math.max(1,ctx.workingRevealed||1));
    const button = container.querySelector('[data-os-next]');
    button?.addEventListener('click',()=>{
      const item = document.createElement('li'),line=working[shown++];
      if(modelFor(visual,ctx)?.symbolic_math)item.innerHTML=window.RevilyPercentageChangeStructure.symbolicMath(line);else if(modelFor(visual,ctx)?.decimal_math)item.innerHTML=window.RevilyPercentFraction.math(line);else if(modelFor(visual,ctx)?.math_text)item.innerHTML=window.RevilyVisuals.mathMarkup(line);else item.textContent=line;
      container.querySelector('.os-working ol').appendChild(item);
      ctx.onWorkingStep?.(shown);
      if(['percentage_change_structure','mixed_percentage_questions','percentage_comparison','measured_percentage_amount','money_percentage_amount','method_choice_amount','decimal_multiplier_amount','one_percent_amount','percentage_fraction_amount','mixed_fdp','fdp_ordering','fdp_comparison','percent_fraction_conversion','decimal_percent_conversion','equivalent_percent_conversion','division_decimal_conversion','equivalent_decimal_conversion','power_ten_decimal','decimal_fraction_conversion','decimal_scaling','benchmark_equivalence','percent_hundred','place_value_conversion','capstone_problem','additive_timeline','fraction_situation','mixed_subtract_exchange','mixed_subtract_no_exchange','mixed_add_regroup','mixed_add_no_regroup','mixed_conversion','simplify_after_operation','both_denominators_subtract','both_denominators_add','cancel_product','mixed_product','mixed_division','multi_step','reciprocal','fraction_share','unit_groups','proper_groups','fraction_groups'].includes(modelFor(visual,ctx)?.kind)) {
        const nextCtx={...ctx,workingRevealed:shown};
        container.innerHTML=renderMarkup(visual,nextCtx);container.setAttribute('aria-label',accessibleDescription(visual,nextCtx));bind(container,visual,nextCtx);return;
      }
      if(shown>=working.length) { button.hidden=true; container.querySelector('.os-working h2')?.setAttribute('tabindex','-1'); container.querySelector('.os-working h2')?.focus({preventScroll:true}); }
    });
  }
  window.RevilyOperationVisuals = { renderMarkup, accessibleDescription, bind, modelFor, resultFor };
})();
