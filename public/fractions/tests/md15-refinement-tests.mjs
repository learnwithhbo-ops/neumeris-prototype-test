import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const rel='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-15_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
const storage=new Map();
const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>`test-${storage.size}`},setTimeout,clearTimeout};
window.window=window;
const context=vm.createContext({window,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}},localStorage,console,URLSearchParams,setTimeout,clearTimeout});
const load=name=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',name),'utf8'),context,{filename:name});
for(const file of ['validators.js','lesson-model.js','topics.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js']) load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};
load('lesson-engine.js');
const baseInput=window.RevilyLessonEngine.LessonEngine.prototype.inputMarkup;
load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec);
const visuals=window.RevilyOperationVisuals;
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills.find(s=>s.id==='MD-15'),manifest).length,0);
assert.equal(model.nodes.length,24);
assert.equal(spec.spec_intent.source_material.sha256,'9e3c17086fc824dbf61614874593e441c1ec06490381a3c063dc071027512166');
assert.equal(spec.lesson.teaching_steps.length,8);
assert.equal(model.exitIds.length,4);
assert.equal(model.confirmationIds.length,0);
assert.equal(spec.spec_intent.refinement.protected_from_bulk_generation,true);
assert.equal(spec.diagnostic.enabled,false);
assert.equal(spec.question_bank.filter(q=>q.response.type==='exact_number').length,12);
assert.equal(spec.question_bank.filter(q=>q.source_ref.page===6).length,7);
assert.deepEqual(spec.question_bank.filter(q=>q.stage==='exit').map(q=>q.source_ref.page),[13,13,13,13]);
const expected={P01:'15',P02:'10',P03:'30',P04:'5',P05:'3/10',P06:'6',E01:'28',E02:'8',E03:'21'};
for(const [id,value] of Object.entries(expected)) {
  const q=model.getQuestion('MD-15-'+id);
  assert.equal(q.answer.value,value);
  assert.equal(window.RevilyValidators.validate(q,value),true);
  assert.equal(window.RevilyValidators.validate(q,'999'),false);
  assert.equal(window.RevilyValidators.validate(q,'0.3'),false,'decimal notation is not the requested exact form');
  assert.equal(window.RevilyValidators.validate(q,'1/0'),false);
}
assert.equal(window.RevilyValidators.validate(model.getQuestion('MD-15-P05'),'6/20'),true);
assert.equal(window.RevilyValidators.validate(model.getQuestion('MD-15-P03'),'60/2'),true);
assert.equal(window.RevilyValidators.validate(model.getQuestion('MD-15-P04'),'4 2/2'),true);
const initialKinds=new Set();
for(const node of model.nodes) {
  const q=node.question, m=visuals.modelFor(node.visual,{question:q});
  assert.ok(m,`${node.id}: explicit model`);
  initialKinds.add(m.kind);
  const initial=visuals.renderMarkup(node.visual,{question:q,feedback:'initial'});
  const label=visuals.accessibleDescription(node.visual,{question:q,feedback:'initial'});
  assert.doesNotMatch(initial,/undefined|NaN/);
  if(q) {
    assert.doesNotMatch(initial,/os-working|Show next line/,'no solution before submission');
    assert.match(initial,/data-revealed="false"/,'no solved model before submission');
    assert.doesNotMatch(label,/The submitted relationship/);
    const worked=visuals.renderMarkup(node.visual,{question:q,feedback:'worked'});
    assert.match(worked,/Compare your working/);
    assert.equal((worked.match(/<li>/g)||[]).length,1,'first worked line only');
    if(q.working.length>1) assert.match(worked,/Show next line/);
    const restored=visuals.renderMarkup(node.visual,{question:q,feedback:'worked',workingRevealed:99});
    assert.equal((restored.match(/<li>/g)||[]).length,q.working.length);
  }
}
assert.equal(initialKinds.size,4);
assert.throws(()=>visuals.renderMarkup({primitive:'operation_structure'},{}),/explicit authored model/);
const p02=model.getQuestion('MD-15-P02');
const before=visuals.renderMarkup(p02.visual,{question:p02});
const after=visuals.renderMarkup(p02.visual,{question:p02,feedback:'correct'});
assert.equal((before.match(/class="os-vessel"/g)||[]).length,1,'one sample portion, not a revealed answer count');
assert.equal((after.match(/class="os-vessel"/g)||[]).length,10,'ten equal rice portions after submission');
assert.match(visuals.renderMarkup(model.getNode('T05').visual,{}),/os-tank/);
assert.match(visuals.renderMarkup(model.getQuestion('MD-15-P03').visual,{}),/Whole: \?/);
const area=model.getQuestion('MD-15-P05');
assert.equal((visuals.renderMarkup(area.visual,{question:area,feedback:'correct'}).match(/class="os-selected"/g)||[]).length,6,'6 of 20 cells overlap');
const make=()=>{
  const canvas={setAttribute(){},removeAttribute(){},querySelector(){return null;},innerHTML:''};
  const engine=new window.RevilyLessonEngine.LessonEngine({querySelector:()=>null},spec,{},{});
  engine.elements={canvas,primary:{},ryan:null};
  engine.lockInputs=()=>{};engine.refocusInput=()=>{};engine.stopNarration=()=>{};
  engine.showFeedback=(...args)=>{engine.feedback=args;};
  engine.startNarration=(lines,done)=>{engine.narrated=lines;engine.narrationCallback=done;};
  engine.readResponse=()=>engine.testResponse;
  engine.state=engine.freshState();return engine;
};
let e=make(), node=model.getNode('I01');
e.testResponse='4';e.submitAnswer(node);
assert.equal(e.state.attempts[p02.id],1);
assert.equal(e.state.resolved[p02.id],undefined);
assert.doesNotMatch(e.elements.canvas.innerHTML,/os-working/);
e.testResponse='3';e.submitAnswer(node);
assert.equal(e.state.resolved[p02.id],undefined);
assert.match(e.elements.canvas.innerHTML,/Compare your working/);
e.testResponse='2';e.submitAnswer(node);
assert.equal(e.state.resolved[p02.id],undefined,'third wrong answer cannot silently resolve');
e.testResponse='10';e.submitAnswer(node);
assert.equal(e.state.resolved[p02.id],'correct_after_support');
assert.equal(e.narrationCallback,null,'correct feedback must not auto-advance');
assert.equal(e.state.evidence.firstAttemptCorrect[p02.id],false);
e=make();node=model.getNode('G01');e.testResponse='1';e.submitAnswer(node);
assert.equal(e.state.evidence.firstAttemptCorrect[node.questionId],undefined);
assert.equal(e.state.engagementResponses[node.questionId].correct,null);
assert.equal(e.state.engagementResponses[node.questionId].matched,false);
const wrongFeedback=e.feedback[1];
e=make();e.testResponse='5';e.submitAnswer(node);
assert.notEqual(e.feedback[1],wrongFeedback);
assert.equal(e.state.events.find(event=>event.name==='answer_submitted').scored,false);
e=make();node=model.getNode('T08');e.testResponse='24 ÷ 5/8';e.submitAnswer(node);
assert.equal(e.feedback[1],node.question.response_feedback[e.testResponse],'unscored choices retain response-specific feedback');
for(const wrongCount of [0,1,2,3,4]) {
  e=make();
  model.exitIds.forEach((qid,index)=>{
    const n=model.nodes.find(n=>n.questionId===qid);
    e.testResponse=index<wrongCount?'999':n.question.answer.value;e.submitAnswer(n);
  });
  assert.equal(e.state.exit.result,wrongCount?'NEEDS_WORK':'SECURE');
  assert.equal(e.state.masteryState,wrongCount?'LEARNING':'READY_FOR_RETRIEVAL');
  assert.equal(e.state.exit.confirmationId,null,'no arbitrary two-item replacement check');
}
e=make();
for(const qid of model.exitIds) {
  const n=model.nodes.find(n=>n.questionId===qid);e.state.evidence.hintOpened[qid]=true;
  e.testResponse=n.question.answer.value;e.submitAnswer(n);
}
assert.equal(e.state.exit.result,'NEEDS_WORK','hint-supported evidence cannot pass independent mastery');
// Wrapper isolation: every lesson without the explicit property keeps its existing input path.
const other={spec:{experience_contract:{}},isFra10V1:()=>false,isFra26V1:()=>false,isFra28V1:()=>false};
const integer={response:{type:'integer'},answer:{value:3}};
assert.equal(window.RevilyLessonEngine.LessonEngine.prototype.inputMarkup.call(other,integer,'',false),baseInput.call(other,integer,'',false));
// A source update archives, rather than erases, the learner's previous bulk attempt.
e=make();const old={...e.freshState(),contentVersion:null,soundOn:false,status:'SECURE',submissions:{old:[{response:3}]}};
localStorage.setItem(e.storageKey,JSON.stringify(old));
const migrated=e.loadState();assert.equal(migrated.soundOn,false);assert.equal(migrated.cursor,'T01');
assert.equal(JSON.parse(localStorage.getItem(e.historyKey)).at(-1).submissions.old[0].response,3);
assert.equal(fs.readFileSync(path.join(root,rel),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',rel),'utf8'));
console.log('MD-15 source mapping, exact answers, visual states, feedback/correction, unscored responses, all-four mastery, migration, and profile isolation passed.');
