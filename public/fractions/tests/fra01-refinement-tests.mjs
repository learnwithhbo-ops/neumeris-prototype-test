import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const context=vm.createContext({window:{},console});
for(const file of ['fra01-canonical-v2.js','fra01-visuals.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
}
const spec={
  identity:{id:'FRA-01',estimated_minutes:{}},
  experience_contract:{global_ui_copy:{}},voice_and_script:{},visual_language:{},engine_capability_requirements:{},
  diagnostic:{},lesson:{exit:{},teaching_steps:[],transfer_steps:{}}
};
context.window.RevilyFra01CanonicalV2.apply(spec);
const V=context.window.RevilyFra01Visuals,q=id=>spec.question_bank.find(item=>item.id===`FRA-01-${id}`);
const markup=(id,feedback='initial',response)=>V.renderMarkup({}, {question:q(id),feedback,response});
const count=(html,cls)=>[...html.matchAll(new RegExp(`class="${cls}(?:[ "])`,'g'))].length;
const selected=(html,cls)=>[...html.matchAll(new RegExp(`class="${cls} is-selected(?:[ "])`,'g'))].length;

for(const[id,cls,total,chosen]of[
  ['G2','fra01-cake-slice',6,2],['F1','fra01-piece',7,3],['F2','fra01-token',8,5],
  ['I1','fra01-piece',10,7],['M1','fra01-piece',9,4],['M2','fra01-token',11,6],
  ['C-WHOLE-1','fra01-token',9,4],['C-WHOLE-2','fra01-token',10,7],
  ['C-CONTEXT-1','fra01-piece',8,5],['C-CONTEXT-2','fra01-piece',12,8],
  ['C-ORDER-1','fra01-piece',6,2],['C-ORDER-2','fra01-piece',8,5]
])for(const feedback of ['initial','hint','worked']){
  const html=markup(id,feedback);
  assert.equal(count(html,cls),total,`${id}/${feedback}: whole count`);
  assert.equal(selected(html,cls),chosen,`${id}/${feedback}: target count`);
}

assert.match(markup('C-ORDER-2'),/is-tiles/,'tile wording must use a tile model');
assert.doesNotMatch(markup('C-ORDER-2'),/is-board/);
assert.match(markup('G2','hint',{n:'2',d:'7'}),/hint-focus-whole/);
assert.match(markup('G2','hint',{n:'3',d:'6'}),/hint-focus-selected/);
assert.doesNotMatch(markup('G2','initial',{n:'3',d:'6'}),/hint-focus-/);
assert.match(q('R-EQUAL').visual.syncCues[0].action,/repair_equal_cut/);
assert.match(q('R-ORDER').visual.syncCues[0].action,/reveal_fraction/);
assert.equal(V.accessibleDescription(q('R-WHOLE').model),'One whole group containing 9 tokens. 4 are highlighted.');
for(const item of spec.question_bank.filter(item=>item.policy.scored&&item.response.type==='fraction')){
  const description=V.accessibleDescription(item.model);
  assert.doesNotMatch(description,/\d|out of|fraction is/);
  const parts=description.split('reading order: ')[1].slice(0,-1).split('; ');
  assert.equal(parts.length,item.model.totalParts,`${item.id}: accessible part count`);
  assert.equal(parts.filter(value=>value===item.model.selectedMeaning).length,item.model.selectedParts,`${item.id}: accessible target count`);
}
assert.equal(spec.experience_contract.completion_header_controls,true);
assert.equal(spec.experience_contract.deduplicate_exit_repairs,true);
assert.equal(spec.experience_contract.sequential_locked_working,true);
for(const id of ['M1','M2','M3']){
  assert.equal(q(id).scripts.worked_steps.length,3);
  assert.ok(q(id).scripts.worked_steps.every((step,index)=>!step.startsWith(`${index+1}.`)));
}
assert.equal(spec.diagnostic.enabled,false);
assert.equal(spec.lesson.exit.primary_question_refs.length,3);
assert.equal(spec.question_bank.length,22);

const css=fs.readFileSync(path.join(root,'fractions/styles.css'),'utf8');
assert.match(css,/\.math-canvas:has\(\.fra01-choice-canvas\)/);
assert.match(css,/\.cue-repair_equal_cut \.fra01-context-visual \.repair-strip-equal/);
assert.match(css,/\.fra01-segmented\.is-tiles/);
assert.match(css,/\.hint-focus-whole\) \.guided-builder-steps label:nth-of-type\(2\)/);
assert.match(css,/\.teaching-surface:has\(\.fra01-context-visual\) \.canvas-caption:empty/);
console.log('FRA-01 refinement: exact authored quantities, accessible non-answer part sequences, focused guided repair, tile context, speech-led equal-parts repair, flow captions and scoped completion/recovery controls passed.');
