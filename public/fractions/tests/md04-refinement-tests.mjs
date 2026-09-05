import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-04_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>`attempt-${storage.size}`},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,validate=window.RevilyValidators.validate;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[3],manifest).length,0);
assert.equal(model.nodes.length,26);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);
assert.equal(spec.question_bank.length,20);assert.equal(spec.diagnostic.enabled,false);
assert.equal(spec.spec_intent.source_material.sha256,'0344c51be6f51755180efcc5c49689d2486c5b00f1a86b0f40cc63e318f89238');
const answers={G01:'5/1',G02:15,G03:11,G04:'15/11',P01:'6/7',P02:'8/9',P03:'9/10',P04:'20/13',P05:'35/12',P06:'8/5',X01:'6/7',X02:'8/9',X03:'35/12',X04:'2/9 × 4',E01:'12/11',E02:'10/13'};
for(const [short,value] of Object.entries(answers))assert.equal(model.getQuestion(`MD-04-${short}`).answer.value,value);
assert.deepEqual(spec.question_bank.filter(q=>q.stage==='exit').map(q=>q.source_ref.page),[13,13,13]);
for(const [short,pieces,selected] of [['T01',21,6],['T02',7,6]]) {
 const html=visuals.renderMarkup(model.getNode(short).visual);
 assert.equal((html.match(/data-unit-piece/g)||[]).length,pieces);
 assert.equal((html.match(/data-selected-piece="true"/g)||[]).length,selected);
 const widths=[...html.matchAll(/width="([\d.]+)" height="32"/g)].map(m=>Number(m[1]));
 assert.ok(widths.every(w=>Math.abs(w-450/7)<0.0001),'seventh-sized pieces must not resize');
}
assert.match(visuals.renderMarkup(model.getNode('T04').visual),/>4<\/text>.*>1<\/text>/);
assert.match(visuals.renderMarkup(model.getNode('T05').visual),/Number of parts: 8/);
assert.doesNotMatch(visuals.renderMarkup(model.getNode('T05').visual),/Total: 8\/9/);
assert.match(visuals.renderMarkup(model.getNode('T06').visual),/Denominator: 9 × 1 = 9/);
assert.match(visuals.renderMarkup(model.getNode('T07').visual),/Total: 8\/9/);
const shape=model.getQuestion('MD-04-G01');assert.equal(validate(shape,'10/2'),false);assert.equal(validate(shape,'5'),false);assert.equal(validate(shape,{n:'5',d:'1'}),true);
const c01=model.getQuestion('MD-04-C01');assert.doesNotMatch(visuals.accessibleDescription(c01.visual,{question:c01}),/unchanged|same whole|remain/);
const improper=model.getQuestion('MD-04-P05');
const improperHtml=visuals.renderMarkup(improper.visual,{question:improper,feedback:'correct'});
assert.equal((improperHtml.match(/data-selected-piece="true"/g)||[]).length,35);
assert.equal((improperHtml.match(/data-unit-piece/g)||[]).length,36);
assert.equal(validate(improper,{whole:'2',n:'11',d:'12'}),true);assert.equal(validate(improper,'70/24'),true);assert.equal(validate(improper,'2.9167'),false);
const rods=model.getQuestion('MD-04-X03');assert.match(visuals.renderMarkup(rods.visual,{question:rods,feedback:'correct'}),/7 rods; each rod 5\/12 m/);
for(const node of model.nodes.filter(n=>n.question)) {
 const q=node.question,initial=visuals.renderMarkup(node.visual,{question:q});
 assert.match(initial,/data-revealed="false"/);assert.doesNotMatch(initial,/os-working|NaN|undefined/);
 assert.equal(validate(q,q.answer.value),true);assert.equal(validate(q,'99999'),false);
 assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
 assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
 if(q.visual.model.kind==='whole_multiple'&&!q.visual.model.phase){assert.doesNotMatch(initial,/Total: \d/);assert.equal((initial.match(/data-selected-piece="true"/g)||[]).length,q.visual.model.n,'only one sample fraction is countable before independent submission');}
 if(q.stage==='exit'&&q.response.type==='fraction')assert.equal(spec.question_bank.some(other=>other.stage!=='exit'&&other.visual.model.n===q.visual.model.n&&other.visual.model.d===q.visual.model.d&&other.visual.model.copies===q.visual.model.copies),false,'mastery product must be fresh');
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
const wrongShape=engine();wrongShape.response={n:'5',d:'5'};wrongShape.submitAnswer(model.nodes.find(n=>n.questionId==='MD-04-G01'));assert.match(wrongShape.feedback[1],/one whole, not five/);
const p01=model.getQuestion('MD-04-P01'),wrongParts=engine();wrongParts.response={n:'6',d:'21'};wrongParts.submitAnswer(model.nodes.find(n=>n.questionId===p01.id));assert.match(wrongParts.feedback[1],/equivalent to the original fraction/);
assert.match(visuals.renderMarkup(p01.visual,{question:p01,feedback:'correct'}),/aria-label="3 over 1"/,'post-submit mathematical working uses a stacked fraction');
for(let mask=0;mask<8;mask++){
 const e=engine();model.exitIds.forEach((qid,i)=>{const n=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?'99999':n.question.answer.value;e.submitAnswer(n);});assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
const inputEngine=engine(),input=inputEngine.inputMarkup(improper,null,false),restored=inputEngine.inputMarkup(improper,{whole:'2',n:'11',d:'12'},true);
const methodMarkup=inputEngine.inputMarkup(model.getQuestion('MD-04-C02'),null,false);
assert.match(methodMarkup,/aria-label="2 × 4 over 9 × 1"/);assert.match(methodMarkup,/aria-label="2 over 9 × 4"/);assert.match(methodMarkup,/aria-label="2 \+ 4 over 9"/);assert.doesNotMatch(methodMarkup,/\)\/\(/);
assert.match(input,/<div class="fraction-input">/);assert.match(input,/id="os-whole-label" hidden/);assert.match(input,/aria-expanded="false"/);assert.match(restored,/aria-expanded="true"/);assert.match(restored,/value="2" disabled/);
assert.ok(restored.indexOf('id="os-answer-whole"')<restored.indexOf('id="fraction-n"'),'mixed-number keyboard order follows the visible order');
const formDrafts={},switchForm=window.RevilySourceAlignedProfile.changeAnswerForm;
assert.equal(JSON.stringify(switchForm(formDrafts,{n:'35',d:'12'},'mixed')),JSON.stringify({whole:'',n:'',d:''}),'switching never solves or converts the answer');
assert.equal(JSON.stringify(switchForm(formDrafts,{whole:'2',n:'11',d:'12'},'fraction')),JSON.stringify({n:'35',d:'12'}));
assert.equal(JSON.stringify(switchForm(formDrafts,{n:'70',d:'24'},'mixed')),JSON.stringify({whole:'2',n:'11',d:'12'}));
assert.doesNotMatch(window.RevilyVisuals.mathMarkup(model.getQuestion('MD-04-G05').prompt),/over 11\?/,'sentence punctuation must not become part of the denominator');
const fakeFields={'#fraction-n':{value:'11'},'#fraction-d':{value:'12'},'#os-whole-label':{hidden:false},'#os-answer-whole':{value:'2'}};
inputEngine.root={querySelector:selector=>fakeFields[selector]};const read=window.RevilyLessonEngine.LessonEngine.prototype.readResponse.bind(inputEngine);
assert.equal(validate(improper,read(improper)),true);fakeFields['#fraction-d'].value='0';assert.equal(read(improper),null);fakeFields['#fraction-d'].value='12';fakeFields['#os-answer-whole'].value='2.5';assert.equal(read(improper),null);
assert.equal(fs.readFileSync(path.join(root,relative),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',relative),'utf8'));
console.log('MD-04 source answers, stable part widths, repeated groups, improper totals, optional mixed input, fraction-specific feedback, all checkpoint ladders and all 8 mastery outcomes passed.');
