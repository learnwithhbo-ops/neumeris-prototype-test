import katex from './vendor/katex/katex.mjs';
import {notation} from './math-notation.js';

const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const entries=new Map(notation.map(([plain,tex,display])=>[plain,{tex,display}]));
// Units and numerical quantities have a narrow, explicit grammar. Algebra is
// authored in the registry, never inferred from learner answers or prose.
const units=String.raw`(?:W m⁻² K⁻⁴|W m⁻²|J m⁻²|m²|°C|K|W|J|Hz|s)`;
const quantity=String.raw`(?:\d+(?:\.\d+)?\s*${units}|W m⁻² K⁻⁴|W m⁻²|J m⁻²|m²|°C)`;
const matcher=new RegExp(String.raw`(?<![\p{L}\p{N}_])(?:${[...entries.keys()].sort((a,b)=>b.length-a.length).map(escapeRE).join('|')}|${quantity})(?![\p{L}\p{N}_])`,'gu');
const unitTeX={'W m⁻² K⁻⁴':String.raw`\mathrm{W\,m^{-2}\,K^{-4}}`,'W m⁻²':String.raw`\mathrm{W\,m^{-2}}`,'J m⁻²':String.raw`\mathrm{J\,m^{-2}}`,'m²':String.raw`\mathrm{m^2}`,'°C':String.raw`{}^\circ\mathrm C`};
const cache=new Map();
export function typeset(tex,display=false,fallback=tex){
 const key=display+'|'+tex;if(cache.has(key))return cache.get(key);
 let html;
 try{html=katex.renderToString(tex,{displayMode:display,output:'htmlAndMathml',throwOnError:true,trust:false,strict:'error'});}
 catch(error){console.error('Invalid lesson notation',tex,error);return escapeHTML(fallback);}
 const result=`<span class="${display?'math-display':'math-inline'}">${html}</span>`;
 if(cache.size>1500)cache.clear();cache.set(key,result);return result;
}
function quantityTeX(plain){
 const m=plain.match(/^(\d+(?:\.\d+)?)?\s*(.+)$/);
 return (m[1]?m[1]+String.raw`\,`:'')+(unitTeX[m[2]]??String.raw`\mathrm{${m[2]}}`);
}
export function formatText(value,display=false){
 const text=String(value??'');let html='',last=0;
 for(const m of text.matchAll(matcher)){
  html+=escapeHTML(text.slice(last,m.index));const entry=entries.get(m[0]);
  html+=typeset((display&&entry?.display)||entry?.tex||quantityTeX(m[0]),display,m[0]);last=m.index+m[0].length;
 }
 return html+escapeHTML(text.slice(last));
}
export function formatEquation(value){
 // Only complete formula spans use display mode. A definition such as
// “E₁ and E₂: energy levels” stays inline instead of making several empty rows.
 const entry=entries.get(String(value));
 if(entry)return typeset(entry.display??entry.tex,true,value);
 const colon=String(value).indexOf(':');
 if(colon>=0){const suffix=String(value).slice(colon+1).trim(),formula=entries.get(suffix);if(formula)return `<span class="equation-context">${formatText(String(value).slice(0,colon+1))}</span>${typeset(formula.display??formula.tex,true,suffix)}`;}
 return formatText(value);
}
