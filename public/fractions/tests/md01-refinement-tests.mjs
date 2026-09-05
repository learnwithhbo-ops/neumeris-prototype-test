import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-01_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>`attempt-${storage.size}`},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=name=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',name),'utf8'),context,{filename:name});
for(const file of ['validators.js','lesson-model.js','topics.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec), visuals=window.RevilyOperationVisuals, validate=window.RevilyValidators.validate;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.deepEqual(Array.from(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[0],manifest)),[]);
assert.equal(model.nodes.length,23);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);
assert.equal(spec.lesson.teaching_steps.length,7);assert.equal(spec.diagnostic.enabled,false);
const expected={G01:6,G02:7,G03:7,P01:8,P02:7,P03:9,P04:10,P05:11,P06:'7',X01:8,X02:13,E01:9,E02:8};
for(const [short,answer] of Object.entries(expected))assert.equal(model.getQuestion('MD-01-'+short).answer.value,answer,`${short}: approved source answer`);
assert.equal(spec.spec_intent.source_material.sha256,'f178f1e55d54ae7ab5379b7aa2b682098bf7f92c11616f25cd41f4a89fa43596');
assert.deepEqual(spec.question_bank.filter(q=>q.stage==='exit').map(q=>q.source_ref.page),[11,11,11]);
for(const node of model.nodes) {
  const q=node.question,ctx={question:q}, initial=visuals.renderMarkup(node.visual,ctx);
  assert.doesNotMatch(initial,/NaN|undefined|data-counter=""[^]*data-counter=""[^]*NaN/);
  if(!q)continue;
  assert.equal(validate(q,q.answer.value),true);assert.equal(validate(q,'999999'),false);
  assert.match(initial,/data-revealed="false"/);assert.doesNotMatch(initial,/os-working/);
  assert.doesNotMatch(visuals.renderMarkup(node.visual,{...ctx,feedback:'hint'}),/os-working/);
  const support=visuals.renderMarkup(node.visual,{...ctx,feedback:'support'});
  assert.equal((support.match(/<li>/g)||[]).length,1);
  if(q.response.type==='integer')for(const wrong of ['1/0','7/1','7.2','7 + 0',''])assert.equal(validate(q,wrong),false);
  assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
  assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
}
for(const scene of ['T01','T02','T03']) {
  const html=visuals.renderMarkup(model.getNode(scene).visual,{});
  assert.equal((html.match(/data-counter=""/g)||[]).length,24,'counter total remains 24 across grouping');
  assert.equal((html.match(/class="os-selected"/g)||[]).length,scene==='T03'?1:0);
}
assert.notEqual(visuals.renderMarkup(model.getNode('T01').visual),visuals.renderMarkup(model.getNode('T02').visual),'grouping changes the model');
const practicePrompts=new Set(spec.question_bank.filter(q=>q.stage!=='exit').map(q=>q.prompt));
for(const q of spec.question_bank.filter(q=>q.stage==='exit'))assert.equal(practicePrompts.has(q.prompt),false);
for(const q of spec.question_bank.filter(q=>q.stage==='exit'&&q.response.type==='integer'))assert.equal(spec.question_bank.some(other=>other.stage!=='exit'&&other.visual.model.total===q.visual.model.total&&other.visual.model.d===q.visual.model.d),false,'mastery calculation is unseen, even under a different context');
const red=model.getQuestion('MD-01-X01');assert.equal((visuals.renderMarkup(red.visual,{question:red,feedback:'correct'}).match(/os-red-counter/g)||[]).length,8);
assert.equal(window.RevilyLessonEngine.LessonEngine.prototype.narrationAdvanceDelayMs.call({spec}),280);
{let options;window.RevilyLessonEngine.LessonEngine.prototype.refocusInput.call({spec,root:{querySelector:()=>({focus:opts=>{options=opts;}})}});assert.equal(options.preventScroll,true,'retry focus must not scroll the worked model out of view');}
const assisted=model.getQuestion('MD-01-P01');assert.match(visuals.renderMarkup(assisted.visual,{question:assisted,feedback:'correct',firstStepAssisted:true}),/Ryan showed this step/);
function engine() {
  const e=new window.RevilyLessonEngine.LessonEngine({querySelector:()=>null},spec,{},{});
  e.elements={canvas:{setAttribute(){},removeAttribute(){},querySelector(){return null;},innerHTML:''},primary:{},ryan:null};
  e.lockInputs=()=>{e.inputsLocked=true;};e.refocusInput=()=>{};e.stopNarration=()=>{};
  e.showFeedback=(...args)=>e.feedback=args;e.startNarration=(lines,done)=>{e.lines=lines;e.done=done;};
  e.readResponse=()=>e.response;e.advance=()=>{e.advanced=true;};e.state=e.freshState();return e;
}
for(const node of model.nodes.filter(n=>n.question&&!n.exit&&!n.question.policy.engagementOnly)) {
  let e=engine();e.response=node.question.answer.value;e.submitAnswer(node);
  assert.equal(e.state.resolved[node.questionId],'correct');
  assert.equal(typeof e.done,node.question.policy.autoContinueAfterFeedback?'function':'object');
  if(e.done){e.done();assert.equal(e.advanced,true);}
  for(const wrongCount of [1,2,3]) {
    e=engine();e.response='999999';
    for(let i=0;i<wrongCount;i++){e.submitAnswer(node);assert.equal(e.state.resolved[node.questionId],undefined);}
    assert.equal(e.state.feedback[node.questionId],wrongCount===1?'first_incorrect':'support');
    assert.equal(e.elements.canvas.innerHTML.includes('os-working'),wrongCount>=2);
    e.response=node.question.answer.value;e.submitAnswer(node);
    assert.equal(e.state.resolved[node.questionId],'correct_after_support');assert.equal(e.state.evidence.firstAttemptCorrect[node.questionId],false);
  }
}
for(const short of ['G03','G04']) {
  const node=model.getNode(short),a=engine(),b=engine();a.response='999999';b.response=node.question.answer.value;a.submitAnswer(node);b.submitAnswer(node);
  assert.notEqual(a.feedback[1],b.feedback[1]);assert.equal(a.state.engagementResponses[node.questionId].correct,null);
  assert.equal(a.state.evidence.firstAttemptCorrect[node.questionId],undefined);
}
{const e=engine(),n=model.getNode('I01');e.response=n.question.answer.value;e.submitAnswer(n);e.inputsLocked=false;e.restoreResolvedFeedback(n);assert.equal(e.inputsLocked,true,'refresh must lock all controls, not only the text field');}
for(let mask=0;mask<8;mask++) {
  const e=engine();model.exitIds.forEach((qid,i)=>{const node=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?'999999':node.question.answer.value;e.submitAnswer(node);});
  assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
assert.equal(fs.readFileSync(path.join(root,relative),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',relative),'utf8'));
console.log('MD-01 source answers, conserved counter quantities, concealed results, every checkpoint retry ladder, automatic checkpoint handoff, unscored feedback, and all 8 mastery outcomes passed.');
