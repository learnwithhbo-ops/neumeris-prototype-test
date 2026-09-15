import {assetUrl} from './asset-delivery.js';
export const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function partLabel(label){if(label==='whole')return 'Question';const bits=label.split('.');const section=/^\d+$/.test(bits[0])?'Part '+bits.shift()+' ':'';return section+bits.map(x=>'('+x+')').join('');}
export function images(assets,label,eager=false,presentation={}){
  return (assets??[]).map((a,i)=>{
    const frame=presentation[a.path]??{};if(frame.hidden)return '';
    const scale=(a.dpi??144)/72,box=a.crop_pdf_points_top_left;
    const width=frame.size?.[0]??Math.round(box[2]*scale),height=frame.size?.[1]??Math.round(box[3]*scale);
    const [x,y,w,h]=frame.crop??[0,0,width,height];
    const masks=(frame.masks??[]).map(([mx,my,mw,mh])=>`<span aria-hidden="true" style="position:absolute;background:white;left:${100*(mx-x)/w}%;top:${100*(my-y)/h}%;width:${100*mw/w}%;height:${100*mh/h}%"></span>`).join('');
    return `<figure class="part-excerpt" style="max-width:${w}px"><div class="excerpt-window" style="aspect-ratio:${w}/${h}"><img src="${assetUrl(a.path)}" alt="${escape(label)}" width="${width}" height="${height}" style="width:${100*width/w}%;left:${-100*x/w}%;top:${-100*y/h}%" loading="${eager&&i===0?'eager':'lazy'}" decoding="async">${masks}</div></figure>`;
  }).join('');
}
function answerBody(p,presentation,completion){
  let body='';const a=p.answer?.text||p.answer?.assets?.length?p.answer:completion;
  if(p.supplied_result&&!a?.text)body+=`<p class="answer-key">${escape(p.supplied_result.text)}</p>`;
  if(a?.text)body+=`<p class="answer-key">${escape(a.text.replace(/^Source answer\s*:\s*/i,''))}</p>`;
  if(a?.assets?.length)body+=images(a.assets,'Answer '+(p.label==='whole'?'':partLabel(p.label)),false,presentation);
  return body||'<p>The answer for this question is not available yet.</p>';
}
export function focusedCard(result,index,data){
  const imageSet=(assets,label,eager=false)=>images(assets,label,eager,data.presentation);
  const {question:q,targets}=result,selected=new Set(targets),shownContexts=new Set(),shownSupport=new Set();
  const parts=q.parts.filter(p=>selected.has(p.label)),ordered=[],emitted=new Set(),visiting=new Set();
  function order(p){if(!p||emitted.has(p.label))return;if(visiting.has(p.label))throw new Error('Cyclic prerequisite map');visiting.add(p.label);for(const dep of p.depends_on??[])if(selected.has(dep))order(q.parts.find(x=>x.label===dep));visiting.delete(p.label);emitted.add(p.label);ordered.push(p);}
  parts.forEach(order);let content='';
  for(const p of ordered){
    for(const label of p.depends_on??[]){
      if(selected.has(label)||shownSupport.has(label))continue;shownSupport.add(label);
      const dep=q.parts.find(x=>x.label===label),given=dep?.bridge_result??dep?.supplied_result;
      if(!given)throw new Error('Missing reviewed result for '+q.id+':'+label);
      content+=`<section class="part-context given-result" data-support="${escape(label)}"><strong>Use this result</strong><p>${escape(given.text)}</p>${imageSet(given.assets,'Given result')}</section>`;
    }
    for(const cid of p.context_ids??[]){
      if(shownContexts.has(cid))continue;const c=q.contexts.find(x=>x.id===cid);if(!c)continue;shownContexts.add(cid);
      content+=`<section class="part-context">${c.display_text?`<p>${escape(c.display_text)}</p>`:imageSet(c.assets,'Question information',index===0)}</section>`;
    }
    if(p.given_text)content+=`<section class="part-context given-result"><strong>Given</strong><p>${escape(p.given_text)}</p></section>`;
    const prompt=data.answers?.entries?.[q.id+':'+p.label]?.display_text??p.display_text;
    content+=`<section class="focused-part target-part" data-part="${escape(p.label)}">${parts.length>1?`<div class="part-heading"><h3>${escape(partLabel(p.label))}</h3>${p.marks!=null?`<span class="part-marks">${p.marks} ${p.marks===1?'mark':'marks'}</span>`:''}</div>`:''}${prompt?`<p class="adapted-prompt">${escape(prompt)}</p>`:imageSet(p.assets,'Practice question '+(index+1)+(p.label==='whole'?'':' '+partLabel(p.label)),index===0)}</section>`;
  }
  const help=kind=>ordered.map(p=>{
    const g=data.guidance?.entries?.[p.duplicate_group??q.id+':'+p.label];
    if(!g)throw new Error('Missing question guidance: '+q.id+':'+p.label);
    const body=kind==='answer'?answerBody(p,data.presentation,data.answers?.entries?.[q.id+':'+p.label]):kind==='hint'?`<p>${escape(g.hint)}</p>`:`<ul>${g.notes.map(n=>`<li>${escape(n)}</li>`).join('')}</ul>`;
    return `<section class="help-section">${ordered.length>1?`<h3>${escape(partLabel(p.label))}</h3>`:''}${body}</section>`;
  }).join('');
  const marks=parts.length===1?parts[0].marks:null;
  const helpItems=[['hint','Hint'],['notes','Key notes'],['answer','Answer']];
  const controls=helpItems.map(([kind,label])=>`<button type="button" class="help-toggle" id="help-toggle-${index}-${kind}" aria-expanded="false" aria-controls="help-${index}-${kind}" data-help-toggle>${label}</button>`).join('');
  const panels=helpItems.map(([kind,label])=>`<section class="help-content help-${kind}" id="help-${index}-${kind}" aria-labelledby="help-toggle-${index}-${kind}" hidden><h3 class="help-title">${label}</h3>${help(kind)}</section>`).join('');
  return `<article class="question-card focused-card" id="question-${escape(q.id)}" data-question-index="${index}" aria-labelledby="question-title-${index}"><div class="question-head"><h2 id="question-title-${index}">Practice question ${index+1}</h2>${marks!=null?`<span class="question-marks">${marks} ${marks===1?'mark':'marks'}</span>`:''}</div>${content}<div class="help-actions"><div class="help-controls" role="group" aria-label="Question help">${controls}</div>${panels}</div></article>`;
}
