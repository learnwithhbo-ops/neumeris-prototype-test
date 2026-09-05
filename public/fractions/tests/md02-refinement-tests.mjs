import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-02_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>`attempt-${storage.size}`},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,validate=window.RevilyValidators.validate;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[1],manifest).length,0);
assert.equal(model.nodes.length,26);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);
assert.equal(spec.question_bank.length,20);assert.equal(spec.diagnostic.enabled,false);
assert.equal(spec.spec_intent.source_material.sha256,'9736f5a213e9bab7eaebb04cfadb133520b8bb50f1644a87a59c7ab47d77953b');
const answers={G01:6,G02:7,G03:5,G04:35,G05:35,P01:18,P02:27,P03:32,P04:45,P05:63,P06:'39',X02:56,X03:84,E01:27,E02:40};
for(const [short,value] of Object.entries(answers))assert.equal(model.getQuestion(`MD-02-${short}`).answer.value,value);
assert.match(spec.curriculum.boundaries.includes.join(' '),/multiplication-first/);
assert.doesNotMatch(spec.concept_model.common_confusions.join(' '),/multiplying before dividing/);
assert.deepEqual(spec.question_bank.filter(q=>q.stage==='exit').map(q=>q.source_ref.page),[12,12,12]);
for(const short of ['T01','T02','T03']) {
  const node=model.getNode(short),html=visuals.renderMarkup(node.visual);
  assert.equal((html.match(/data-counter/g)||[]).length,30);
  assert.equal((html.match(/class="os-selected"/g)||[]).length,short==='T01'?0:short==='T02'?1:3);
}
assert.match(visuals.renderMarkup(model.getNode('T03').visual),/3 groups contain 18/);
assert.match(visuals.renderMarkup(model.getNode('T06').visual),/One share: 8/);
assert.doesNotMatch(visuals.renderMarkup(model.getNode('T06').visual),/3 shares: 24/);
const intermediate=model.getQuestion('MD-02-G02');
assert.match(visuals.renderMarkup(intermediate.visual,{question:intermediate,feedback:'correct'}),/One share: 7/);
assert.doesNotMatch(visuals.renderMarkup(intermediate.visual,{question:intermediate,feedback:'correct'}),/shares: 35/);
const tiles=model.getQuestion('MD-02-X04'),tileHtml=visuals.renderMarkup(tiles.visual,{question:tiles,feedback:'correct'});
assert.equal((tileHtml.match(/data-tile/g)||[]).length,84);assert.equal((tileHtml.match(/os-blue-tile/g)||[]).length,35);
for(const node of model.nodes.filter(n=>n.question)) {
  const q=node.question,initial=visuals.renderMarkup(node.visual,{question:q});
  assert.match(initial,/data-revealed="false"/);assert.doesNotMatch(initial,/os-working|NaN|undefined/);
  assert.equal(validate(q,q.answer.value),true);assert.equal(validate(q,'99999'),false);
  assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
  assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
  if(q.response.type==='integer')for(const bad of ['1/0','27/1','27.1','27 + 0',''])assert.equal(validate(q,bad),false);
  if(q.stage==='exit'&&q.response.type==='integer')assert.equal(spec.question_bank.some(other=>other.stage!=='exit'&&other.visual.model.total===q.visual.model.total&&other.visual.model.n===q.visual.model.n&&other.visual.model.d===q.visual.model.d),false,'final calculation must be fresh');
}
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
for(let mask=0;mask<8;mask++){
  const e=engine();model.exitIds.forEach((qid,i)=>{const n=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?'99999':n.question.answer.value;e.submitAnswer(n);});assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
assert.equal(fs.readFileSync(path.join(root,relative),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',relative),'utf8'));
console.log('MD-02 source answers, one-share/selected-share models, valid method acceptance, all checkpoint ladders, unscored feedback, fresh mastery and all 8 outcomes passed.');
