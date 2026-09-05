import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-03_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>`attempt-${storage.size}`},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,validate=window.RevilyValidators.validate;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[2],manifest).length,0);
assert.equal(model.nodes.length,28);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);
assert.equal(spec.question_bank.length,21);assert.equal(spec.diagnostic.enabled,false);
assert.equal(spec.spec_intent.source_material.sha256,'e016a623acc0b9bcbc5a2207d0d42719d137a2f9d892c1dd3640f47559f51011');
const answers={G01:3,G02:9,G03:7,G04:63,G05:63,P01:27,P02:70,P03:56,P04:72,P05:90,P06:'52',X01:64,X02:63,X03:120,X04:'28 ÷ 4 × 9',E01:55,E02:96};
for(const [short,value] of Object.entries(answers))assert.equal(model.getQuestion(`MD-03-${short}`).answer.value,value);
assert.match(spec.curriculum.boundaries.includes.join(' '),/multiply-then-divide, ratio, bar-model and equation/);
assert.deepEqual(spec.question_bank.filter(q=>q.stage==='exit').map(q=>q.source_ref.page),[13,13,13]);
for(const [short,knownValues,totalValues] of [['T01',0,0],['T02',3,3],['T03',3,5]]) {
 const html=visuals.renderMarkup(model.getNode(short).visual);
 assert.equal((html.match(/data-known-part="true"/g)||[]).length,3);
 assert.equal((html.match(/data-known-part="false"/g)||[]).length,2);
 assert.equal((html.match(/>8<\/text>/g)||[]).length,totalValues);
 assert.equal((html.match(/>\?<\/text>/g)||[]).length,5-totalValues);
 assert.match(html,short==='T03'?/Whole amount: 40/:/Whole amount: \?/);
}
const check=model.getNode('T08');assert.equal(check.visual.scene.model.total,72);assert.equal(check.visual.scene.model.n,5);assert.match(visuals.renderMarkup(check.visual),/5 shares: 45/);
const intermediate=model.getQuestion('MD-03-G02'),middle=visuals.renderMarkup(intermediate.visual,{question:intermediate,feedback:'correct'});
assert.equal(visuals.resultFor(intermediate.visual.model),9);assert.match(middle,/One equal part: 9; whole still unknown/);assert.doesNotMatch(middle,/Whole amount: 63/);
assert.doesNotMatch(visuals.accessibleDescription(intermediate.visual,{question:intermediate,feedback:'correct'}),/63/);
assert.equal(visuals.resultFor({kind:'fraction_amount',total:42,n:5,d:6,resultScope:'unit'}),7,'forward MD02 must retain its denominator division');
const tiles=model.getQuestion('MD-03-X04'),before=visuals.renderMarkup(tiles.visual,{question:tiles}),after=visuals.renderMarkup(tiles.visual,{question:tiles,feedback:'correct'});
assert.equal((before.match(/data-tile/g)||[]).length,28);assert.equal((before.match(/os-blue-tile/g)||[]).length,28);assert.doesNotMatch(before.replace(/<[^>]*>/g,''),/\b63\b/);
assert.equal((before.match(/data-inverse-tile-share/g)||[]).length,9);assert.equal((before.match(/class="os-unknown"/g)||[]).length,5);
assert.equal((after.match(/data-tile/g)||[]).length,63);assert.equal((after.match(/os-blue-tile/g)||[]).length,28);
assert.match(after,/All tiles: 63/);assert.equal(model.getQuestion('MD-03-X02').response.prefix,'£');
for(const node of model.nodes.filter(n=>n.question)) {
 const q=node.question,initial=visuals.renderMarkup(node.visual,{question:q});
 assert.match(initial,/data-revealed="false"/);assert.doesNotMatch(initial,/os-working|NaN|undefined/);
 assert.equal(validate(q,q.answer.value),true);assert.equal(validate(q,'99999'),false);
 assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
 assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
 if(q.response.type==='integer')for(const bad of ['1/0','63/1','63.1','9 × 7',''])assert.equal(validate(q,bad),false);
 if(['faded','independent_transfer','practice','exit'].includes(q.stage)&&q.visual.model.kind==='rebuild_amount'){
  assert.ok(visuals.resultFor(q.visual.model)>q.visual.model.known,'a proper-fraction part is smaller than its whole');
  assert.doesNotMatch(initial,/Whole amount: \d|Original money: £\d|Full journey: \d|Sports club: \d|All tiles: \d/);
 }
 if(q.stage==='exit'&&q.response.type==='integer')assert.equal(spec.question_bank.some(other=>other.stage!=='exit'&&other.visual.model.known===q.visual.model.known&&other.visual.model.n===q.visual.model.n&&other.visual.model.d===q.visual.model.d),false,'final calculation must be fresh');
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
console.log('MD-03 source answers, inverse staged model, forward check, intermediate concealment, four contexts, checkpoint ladders, unscored feedback and all 8 mastery outcomes passed.');
