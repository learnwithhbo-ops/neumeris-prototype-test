import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const window={location:{search:''},setTimeout,clearTimeout};
const context=vm.createContext({window,document:{},URL,URLSearchParams,console,setTimeout,clearTimeout});
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',f),'utf8'),context,{filename:f});
for(const f of ['validators.js','lesson-model.js','fra02-canonical.js','fra02-visuals.js'])load(f);
const spec={identity:{id:'FRA-02'},experience_contract:{global_ui_copy:{}},lesson:{}};
window.RevilyFra02Canonical.apply(spec);
const V=window.RevilyFra02Visuals,q=id=>spec.question_bank.find(q=>q.id===`FRA-02-${id}`);
const markup=(item,feedback='initial')=>V.renderMarkup({}, {question:item,feedback});
const count=(html,cls)=>[...html.matchAll(new RegExp(`class="${cls}(?:[ "])`,'g'))].length;
const selectedCount=(html,cls)=>[...html.matchAll(new RegExp(`class="${cls} is-selected(?:[ "])`,'g'))].length;
const pairs={G1:[9,4],G2:[8,3],F1:[9,5],I1:[10,4],M2:[14,5],'R-SWAP':[8,3],'R-DENOM':[9,4],'C-SWAP-1':[10,7],'C-TARGET-1':[9,4],'C-DENOM-2':[11,3],'C-FIELD-1':[7,3],'C-FIELD-2':[6,2]};
for(const [id,[total,selected]] of Object.entries(pairs))for(const feedback of ['initial','hint','correct','support','worked']){
  const html=markup(q(id),feedback);
  assert.equal(count(html,'fra02-cell'),total,`${id}/${feedback}: all parts`);
  assert.equal(selectedCount(html,'fra02-cell'),selected,`${id}/${feedback}: selected parts`);
}
for(const[id,total,selected]of[['M3',13,10],['R-TARGET',8,3],['C-TARGET-2',10,6]]){
  const html=markup(q(id));
  assert.equal(count(html,'fra02-token'),total);
  assert.equal(selectedCount(html,'fra02-token'),selected);
  if(!q(id).policy.reteachOnly)assert.doesNotMatch(html,/<small>/);
}
assert.equal(count(markup(q('C-DENOM-1')),'fra02-cake-slice'),12);
assert.equal(selectedCount(markup(q('C-DENOM-1')),'fra02-cake-slice'),5);
assert.match(markup(q('G1'),'hint'),/hint-focus-selected/);
assert.match(markup(q('G2'),'hint'),/hint-focus-whole/);
assert.doesNotMatch(markup(q('G2')),/hint-focus-whole|fra02-worked/);
assert.doesNotMatch(markup(q('G1')),/NUMERATOR|DENOMINATOR|fra02-worked/);
for(const id of ['F2','I2','M1','M4','C-SWAP-2'])assert.equal(count(markup(q(id)),'fra02-cell'),0,`${id} stays symbolic`);

// Renderer follows declared quantities rather than a wording/assessment-intent label.
const variant=JSON.parse(JSON.stringify(q('G1')));
variant.assessmentIntent='fresh_role_wording';
variant.model={...variant.model,totalParts:7,selectedParts:2,fraction:{numerator:2,denominator:7}};
assert.equal(count(markup(variant),'fra02-cell'),7);
assert.equal(selectedCount(markup(variant),'fra02-cell'),2);
variant.model.showPartModel=false;
assert.equal(count(markup(variant),'fra02-cell'),0);
assert.match(V.accessibleDescription(q('G1').model),/9 equal parts with 4 selected/);
assert.equal(V.accessibleDescription(spec.lesson.teaching_steps.find(s=>s.id==='HANDOFF').scene.model),'Read the fraction; find the role; connect to meaning; use the role.');

for(const id of ['G2','F1','I1','M2','M3','C-SWAP-1','C-TARGET-1','C-TARGET-2','C-DENOM-1','C-DENOM-2','C-FIELD-1','C-FIELD-2']){
  const model=q(id).model,description=V.accessibleDescription(model);
  assert.doesNotMatch(description,/\d|numerator|denominator|over/);
  const parts=description.split('reading order: ')[1].slice(0,-1).split('; ');
  assert.equal(parts.length,model.totalParts);
  assert.equal(parts.filter(p=>p===model.selectedMeaning).length,model.selectedParts);
}
assert.doesNotMatch(markup(q('R-FIELD')),/fra02-cell/);
assert.match(markup(q('R-FIELD')),/>11<\/b>/);
assert.match(V.accessibleDescription(q('R-FIELD').model),/empty top field and a fixed 11/);
assert.doesNotMatch(V.accessibleDescription(q('R-FIELD').model),/selected/);
const targetVariant=JSON.parse(JSON.stringify(q('R-TARGET')));
targetVariant.model.totalParts=10;targetVariant.model.selectedParts=4;
assert.match(markup(targetVariant),/fra02-numerator[^>]*>4</);
assert.match(markup(targetVariant),/fra02-denominator[^>]*>10</);
for(const item of spec.question_bank.filter(q=>q.policy.solutionPolicy==='after_locked_submit')){
  assert.doesNotMatch(markup(item),/fra02-worked/);
  assert.doesNotMatch(markup(item,'worked'),/Locked answer|Locked choice/);
  assert.match(markup(item,'worked'),/The correct (?:fraction|value|statement)/);
}
assert.match(markup(q('M3'),'worked'),/fra02-fraction is-compact/);
assert.equal(q('G2').response.fixedNumerator,3);
assert.equal(q('F1').response.fixedDenominator,9);
assert.equal(spec.diagnostic.enabled,false);
assert.equal(spec.lesson.exit.primary_question_refs.length,4);
assert.equal(spec.lesson.exit.mastery_policy.secureMinimum,3);
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next,'F2');
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.otherwise,'F1');

window.RevilyVisuals={escapeHtml:String,mathMarkup:String,render(){}};
window.RevilyNarrationSync={NarrationSync:class{}};
load('lesson-engine.js');
const engine=Object.create(window.RevilyLessonEngine.LessonEngine.prototype);
engine.spec=spec;
assert.equal(engine.narrationBeatGapMs(),60);
assert.equal(engine.narrationAdvanceDelayMs(),280);
assert.equal(spec.voice_and_script.narration_playback.opening_delay_ms,0);
for(const id of ['M1','M2','M3','M4','C-SWAP-1','C-SWAP-2','C-TARGET-1','C-TARGET-2','C-DENOM-1','C-DENOM-2','C-FIELD-1','C-FIELD-2']){
  const item=q(id);
  for(const lead of [item.scripts.on_correct_reaction,item.scripts.on_incorrect_reaction]){
    assert.deepEqual([...engine.lockedWorkingNarrationLines(item,lead)],[lead]);
    assert.notEqual(lead,item.scripts.worked_explanation);
  }
}
let slot={innerHTML:''};engine.root={querySelector:()=>slot};
for(const id of ['M1','M2','M3','M4']){
  engine.current=()=>({question:q(id)});
  engine.showFeedback('correct',q(id).scripts.on_correct_reaction,q(id).scripts.worked_explanation);
  assert.match(slot.innerHTML,/worked-steps/);
  assert.match(slot.innerHTML,/Step 1/);
  assert.equal(count(slot.innerHTML,'worked-step-label'),q(id).scripts.worked_explanation.split('.').filter(s=>s.trim()).length);
}
engine.spec={canonical_lesson:{engine_profile:'fra02'},voice_and_script:{}};
assert.equal(engine.narrationBeatGapMs(),180);
assert.equal(engine.narrationAdvanceDelayMs(),1500);
assert.deepEqual([...engine.lockedWorkingNarrationLines(q('M1'),'Lead')],['Lead',q('M1').scripts.worked_explanation]);

const css=fs.readFileSync(path.join(root,'fractions/styles.css'),'utf8');
assert.match(css,/\.cue-show_numerator \.variant-numerator \.numerator-role/);
assert.match(css,/\.cue-show_denominator \.variant-denominator \.denominator-role/);
assert.match(css,/\.cue-show_both_roles \.variant-both_roles \.fra02-role/);
assert.match(css,/\.teaching-surface:has\(\.fra02-context-visual\) \.canvas-caption:empty/);

// Two fresh checks must not replay the same completed repair between them.
engine.spec=spec;
engine.model={getQuestion:id=>spec.question_bank.find(q=>q.id===id)};
engine.state={evidence:{errorFamily:{},candidateErrorFamily:{},freshConfirmationPassed:{}},seenConfirmations:[],exit:{}};
engine.emit=()=>{};
engine.beginExitRepair(['FRA-02-M1'],2,'targeted_repair');
assert.equal(engine.state.cursor,'RECOVERY:FRA-02-R-SWAP');
assert.deepEqual([...engine.state.exit.remediation.shownRepairIds],['FRA-02-R-SWAP']);
engine.beginNextExitRepair();
assert.equal(engine.state.cursor,'FRESH:FRA-02-C-SWAP-2');
assert.equal(engine.state.freshContext.exitRemediation,true);
assert.equal(engine.state.freshContext.primaryId,'FRA-02-M1');
assert.equal(engine.state.pendingRecovery,null);
engine.spec={...spec,experience_contract:{}};
engine.state={evidence:{errorFamily:{},candidateErrorFamily:{},freshConfirmationPassed:{}},seenConfirmations:[],exit:{}};
engine.beginExitRepair(['FRA-02-M1'],2,'legacy');
engine.beginNextExitRepair();
assert.equal(engine.state.cursor,'RECOVERY:FRA-02-R-SWAP','opt-out retains the existing recovery route');

const makeElement=()=>({attributes:{},listeners:{},children:[],setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.listeners[k]=v;},replaceWith(v){this.replacement=v;},append(...v){this.children.push(...v);}});
const nodes=new Map();
context.document.createElement=()=>makeElement();
engine.root={setAttribute(){},innerHTML:'',querySelector(id){if(!nodes.has(id))nodes.set(id,makeElement());return nodes.get(id);},querySelectorAll(){return[];}};
engine.spec=spec;engine.topic={title:'Fractions'};engine.state={soundOn:true};
engine.stopNarration=()=>{};engine.startNarration=()=>{};
engine.renderCompletion({result:'SECURE'});
assert.equal(nodes.get('#start-again').attributes['aria-label'],'Start again');
const controls=nodes.get('#start-again').replacement;
assert.equal(controls.children[0].attributes['aria-label'],'Sound on');
assert.equal(controls.children[0].attributes['aria-pressed'],'true');
assert.equal(typeof controls.children[0].listeners.click,'function');
console.log('FRA-02 refinement: exact model counts across feedback states, property-driven G1, counting accessibility, no answer-count labels, clean fixed-field repair, hidden solutions, true fractions, cue-only locked narration, sequential working, reduced delays and unchanged legacy defaults passed.');
