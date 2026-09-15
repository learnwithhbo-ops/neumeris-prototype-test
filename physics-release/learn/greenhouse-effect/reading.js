import {readingFigure,gasSourcesTable} from './reading-figures.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import {formatText as math,formatEquation} from './math.js';
export function readingHTML(lesson){
 const r=lesson.reading;if(!r)throw new Error(`Missing reading content: ${lesson.id}`);
 return `<section class="reading" aria-label="Lesson explanation"><nav class="reading-contents" aria-label="In this lesson"><strong>In this lesson</strong>${r.blocks.map((b,i)=>`<button type="button" data-reading-section="${i}"><span>${i+1}</span>${esc(b.title)}</button>`).join('')}<button type="button" data-reading-practice>Go to exam practice ↓</button></nav><p class="diagram-key"><span><i class="key-solar"></i>Sunlight</span><span><i class="key-reflected"></i>Reflected sunlight</span><span><i class="key-absorbed"></i>Absorbed energy</span><span><i class="key-infrared"></i>Thermal infrared</span></p>${r.blocks.map((b,i)=>`<section class="reading-section" aria-labelledby="reading-title-${i}"><p class="eyebrow">Understand · ${i+1} of ${r.blocks.length}</p><h3 id="reading-title-${i}" tabindex="-1">${esc(b.title)}</h3><div class="reading-grid ${b.figure?'with-figure':''}"><div class="reading-copy">${b.paragraphs.map(p=>`<p>${math(p)}</p>`).join('')}</div>${b.figure?readingFigure(b.figure):''}</div>${b.table==='gas-sources'?gasSourcesTable():''}${(b.equations??[]).map(e=>`<div class="equation-steps"><h4>${math(e.label)}</h4><ol>${e.lines.map(line=>`<li>${formatEquation(line)}</li>`).join('')}</ol></div>`).join('')}${b.key?`<p class="reading-key"><strong>Key idea</strong> ${math(b.key)}</p>`:''}</section>`).join('')}<section class="reading-check"><h3>Check your understanding</h3><p>${math(r.checkpoint.prompt)}</p><details><summary>Compare your explanation</summary><p>${math(r.checkpoint.answer)}</p></details></section></section>`;
}
export function bindReading(root){
 const focusSection=target=>import('../../motion.js').then(m=>m.focusSection(target));
 root.querySelectorAll('[data-reading-section]').forEach(b=>b.addEventListener('click',()=>{const h=root.querySelector(`#reading-title-${b.dataset.readingSection}`);focusSection(h);}));
 root.querySelector('[data-reading-practice]')?.addEventListener('click',()=>{const p=root.querySelector('#exam-practice');focusSection(p);});
}

export function examFocusHTML(lesson){
 return `<section class="section exam-focus" aria-labelledby="exam-practice"><h3 id="exam-practice" tabindex="-1">Exam focus</h3><div class="exam-notes"><div><h4>What a question may ask</h4><ul>${lesson.exam.demands.map(x=>`<li>${math(x)}</li>`).join('')}</ul></div><div><h4>Common mistakes</h4><ul>${lesson.exam.pitfalls.map(x=>`<li>${math(x)}</li>`).join('')}</ul></div></div></section>`;
}
