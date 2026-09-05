import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-11_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>String(storage.size)},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','unit-group-visuals.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,groups=window.RevilyUnitGroupVisuals,validate=window.RevilyValidators.validate;
const question=short=>model.getQuestion('MD-11-'+short);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[10],manifest).length,0);
assert.equal(spec.spec_intent.source_material.sha256,'3e58f523a57a55be23859890b02ba4bc25675612496a3e57d27cdfe220626a69');
assert.equal(spec.question_bank.length,20);assert.equal(model.nodes.length,28);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);assert.equal(spec.diagnostic.enabled,false);
for(const [short,answer] of Object.entries({G01:6,G02:6,G03:24,G04:24,P01:10,P02:14,P03:24,P04:18,P05:90,P06:'28',X01:20,X02:12,X03:18,X04:'5 ÷ 1/8',E01:24,E02:45}))assert.equal(question(short).answer.value,answer);
for(const node of model.nodes) {
  assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:node.question}),/NaN|undefined/);
  assert.doesNotMatch(visuals.accessibleDescription(node.visual,{question:node.question}),/NaN|undefined/);
  if(!node.question)continue;
  const q=node.question,initial=visuals.renderMarkup(node.visual,{question:q});
  assert.match(initial,/data-revealed="false"/);assert.match(initial,/data-compact-captions="true"/);assert.doesNotMatch(initial,/os-working/);
  assert.equal(validate(q,q.answer.value),true,q.id);assert.equal(validate(q,'99999'),false,q.id);
  assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
  assert.doesNotMatch(window.RevilyVisuals.mathMarkup(q.prompt),/aria-label="[^"]*over \d+\?/);
  assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
  if(q.response.type==='integer') {
    assert.equal(validate(q,q.answer.value+'/1'),true);
    assert.equal(validate(q,q.answer.value*2+'/2'),true);
    assert.equal(validate(q,'1/'+q.answer.value),false);
    assert.equal(validate(q,'1/0'),false);
  }
  for(const feedback of ['correct','support'])for(let shown=1;shown<=q.working.length;shown++) {
    assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:q,feedback,workingRevealed:shown}),/NaN|undefined/);
    assert.doesNotMatch(visuals.accessibleDescription(node.visual,{question:q,feedback,workingRevealed:shown}),/NaN|undefined/);
  }
}
assert.match(visuals.accessibleDescription(model.getNode('T02').visual),/One whole contains 4 groups/);
assert.match(visuals.accessibleDescription(model.getNode('T01').visual),/Calculate 3 divided by one over 4/);
assert.match(visuals.renderMarkup(model.getNode('T01').visual),/os-ug-calculation/);
assert.match(visuals.accessibleDescription(model.getNode('T06').visual),/Calculate 5 divided by one over 3/);
assert.doesNotMatch(visuals.accessibleDescription(model.getNode('T06').visual),/15/);
assert.match(visuals.accessibleDescription(model.getNode('T03').visual),/Total 12 groups/);
assert.match(visuals.accessibleDescription(model.getNode('T07').visual),/One whole contains 3 groups/);
assert.match(visuals.accessibleDescription(model.getNode('T08').visual),/Total 15 groups/);
assert.match(visuals.accessibleDescription(model.getNode('T09').visual),/5 over one multiplied by 3 over one/);
assert.doesNotMatch(visuals.accessibleDescription(question('G01').visual),/contains 6|24/);
assert.match(visuals.accessibleDescription(question('G01').visual,{feedback:'correct'}),/One whole contains 6/);
assert.doesNotMatch(visuals.accessibleDescription(question('G03').visual),/24/);
assert.match(visuals.accessibleDescription(question('G03').visual,{feedback:'support',workingRevealed:1}),/total is not shown/);
assert.match(visuals.accessibleDescription(question('G03').visual,{feedback:'support',workingRevealed:2}),/Total 24 groups/);
for(const short of ['X01','X02','X03','X04']) {
  const q=question(short),initial=visuals.accessibleDescription(q.visual);
  assert.doesNotMatch(initial,/divid|multipl|reciprocal/i,'unlabelled contexts must not name the operation');
  assert.match(initial,/number of .* is not shown/);
  if(q.response.type==='integer')assert.equal(q.response.suffix,undefined,'the requested result is a count, not metres, litres or kilograms');
}
assert.match(visuals.renderMarkup(question('X02').visual),/os-ug-bottle/);
assert.match(visuals.renderMarkup(question('X03').visual),/os-ug-bag/);
assert.doesNotMatch(visuals.accessibleDescription(question('X04').visual,{feedback:'correct',workingRevealed:2}),/40/,'operation choice does not reveal an unasked count');
for(const short of ['E01','E02']) {
  const q=question(short),m=q.visual.model;
  assert.equal(spec.question_bank.some(other=>other.stage!=='exit'&&other.visual.model.wholes===m.wholes&&other.visual.model.denominator===m.denominator),false,'the exact final pair is fresh');
}
for(let w=1;w<=12;w++)for(let n=2;n<=12;n++) {
  const m={kind:'unit_groups',object:'bars',wholes:w,denominator:n},initial=groups.render(m),counted=groups.render({...m,phase:'count_all'}),one=groups.render({...m,phase:'one_whole'});
  assert.equal((initial.match(/data-unit-group="true"/g)||[]).length,0,'initial whole rows cannot give away the group count');
  assert.equal((counted.match(/data-unit-whole/g)||[]).length,w);
  assert.equal((counted.match(/data-unit-group="true"/g)||[]).length,w*n);
  assert.equal((one.match(/data-unit-group="true"/g)||[]).length,n);
  assert.equal(window.RevilyValidators.sameRational(w*n+'/'+n,String(w)),true,'all small groups restore the whole-number amount');
  assert.ok(w*n>w);
  assert.match(counted,new RegExp('<b>'+w*n+'</b>'));
}
for(const values of [{wholes:0,denominator:2},{wholes:2,denominator:1},{wholes:2.5,denominator:3},{wholes:2,denominator:0}])assert.throws(()=>groups.render(values));
function engine(){
  const e=new window.RevilyLessonEngine.LessonEngine({querySelector:()=>null},spec,{},{});
  e.elements={canvas:{setAttribute(){},removeAttribute(){},querySelector(){return null;},innerHTML:''},primary:{},ryan:null};
  e.lockInputs=()=>{};e.refocusInput=()=>{};e.stopNarration=()=>{};e.showFeedback=(...args)=>e.feedback=args;
  e.startNarration=(lines,done)=>{e.lines=lines;e.done=done;};e.readResponse=()=>e.response;e.state=e.freshState();return e;
}
for(const node of model.nodes.filter(n=>n.question&&!n.exit&&!n.question.policy.engagementOnly))for(const wrongCount of [0,1,2,3]){
  const e=engine();e.response='99999';for(let i=0;i<wrongCount;i++){e.submitAnswer(node);assert.equal(e.state.resolved[node.questionId],undefined);}
  if(wrongCount)assert.equal(e.elements.canvas.innerHTML.includes('os-working'),wrongCount>=2);
  e.response=node.question.answer.value;e.submitAnswer(node);assert.equal(e.state.resolved[node.questionId],wrongCount?'correct_after_support':'correct');
  assert.equal(typeof e.done,node.question.policy.autoContinueAfterFeedback?'function':'object');
}
for(const node of model.nodes.filter(n=>n.question?.policy.engagementOnly)){
  const good=engine(),bad=engine();good.response=node.question.answer.value;bad.response='99999';good.submitAnswer(node);bad.submitAnswer(node);
  assert.notEqual(good.feedback[1],bad.feedback[1]);assert.equal(bad.state.engagementResponses[node.questionId].correct,null);assert.equal(bad.state.evidence.firstAttemptCorrect[node.questionId],undefined);
}
const one=engine();one.response='6';one.submitAnswer(model.nodes.find(n=>n.questionId==='MD-11-G03'));assert.match(one.feedback[1],/only one/);
const shareSize=engine();shareSize.response='1/24';shareSize.submitAnswer(model.nodes.find(n=>n.questionId==='MD-11-E01'));assert.match(shareSize.feedback[1],/not the requested number of groups/);
for(let mask=0;mask<8;mask++){
  const e=engine();model.exitIds.forEach((qid,i)=>{const node=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?'99999':node.question.answer.value;e.submitAnswer(node);});assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
const e=engine();assert.match(e.inputMarkup(question('E01'),null,false),/integer-answer/);assert.doesNotMatch(e.inputMarkup(question('E01'),null,false),/fraction-input/);
assert.equal(fs.readFileSync(path.join(root,relative),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',relative),'utf8'));
console.log('MD-11: source sequence and answers, 132 conserved unit-group models, per-whole/total distinction, exact integer equivalents, context counts, every correction ladder and all 8 mastery outcomes passed.');
