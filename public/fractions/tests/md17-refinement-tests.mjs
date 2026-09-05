import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const rel='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-17_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
const storage=new Map(),localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>`md17-${storage.size}`},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','mixed-product-visuals.js','reciprocal-visuals.js','fraction-share-visuals.js','unit-group-visuals.js','proper-group-visuals.js','fraction-group-visuals.js','mixed-division-visuals.js','multi-step-visuals.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,validate=window.RevilyValidators.validate;
const question=short=>model.getQuestion(`MD-17-${short}`),clone=value=>JSON.parse(JSON.stringify(value));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills.find(item=>item.id==='MD-17'),manifest).length,0);
assert.equal(spec.spec_intent.source_material.sha256,'1bd8d2162535c6ee34c59fe67e2d409be57da64a69acfb4432c23cc5aa3a55b6');
assert.equal(spec.spec_intent.refinement.version,'MD17-source-aligned-1');
assert.match(spec.spec_intent.refinement.note,/All 21 source pages/);
assert.match(spec.spec_intent.refinement.note,/Entry, Diagnostic, prerequisite routing, delayed Retrieval and Strong remain excluded/);
assert.equal(spec.question_bank.length,34);assert.equal(model.nodes.length,41);assert.equal(model.exitIds.length,6);assert.equal(model.confirmationIds.length,0);
assert.equal(spec.lesson.practice.question_order.length,17);assert.equal(spec.lesson.teaching_steps.length,9);assert.equal(Object.keys(spec.lesson.transfer_steps).length,9);
const expected={G01:9,G02:7,G03:42,G04:5,G05:6,G06:30,G07:5,G08:1,P01:27,P02:48,P03:'1/6',P04:'1/12',P05:8,P06:1,P07:'3 3/4',P08:10,P09:6,P10:30,X01:36,X02:54,X03:3,X04:6,X05:6,X06:'15/16',E01:49,E02:56,E03:'1/6',E04:4,E05:14};
for(const [short,answer] of Object.entries(expected)){const item=question(short);assert.deepEqual(item.answer.value,answer,short);assert.equal(validate(item,answer),true,short);assert.equal(validate(item,'99999'),false,short);}
assert.equal(question('C01').answer.value,'The relationship between what is known and what must be found.');
assert.equal(question('C02').answer.value,'A');assert.equal(question('G09').answer.value,'A');assert.equal(question('P11').answer.value,'A');
assert.equal(question('E06').answer.value,'Select the method from the relationship, calculate exactly, and check the required answer form.');
assert.equal(validate(question('P03'),'12/72'),false,'simplest form is required');assert.equal(validate(question('X06'),'30/32'),false,'simplest form is required');assert.equal(validate(question('P07'),'15/4'),false,'mixed-number form is required');
assert.deepEqual(spec.question_bank.filter(item=>item.source_ref.page===7).map(item=>item.id),Array.from({length:11},(_,i)=>`MD-17-P${String(i+1).padStart(2,'0')}`));
assert.deepEqual(spec.question_bank.filter(item=>item.source_ref.page===17).map(item=>item.id),Array.from({length:6},(_,i)=>`MD-17-X${String(i+1).padStart(2,'0')}`));
assert.deepEqual(spec.question_bank.filter(item=>item.stage==='exit').map(item=>item.source_ref.page),[14,14,14,14,14,14]);
for(const node of model.nodes){const item=node.question,m=visuals.modelFor(node.visual,{question:item});assert.ok(m,`${node.id} explicit model`);const initial=visuals.renderMarkup(node.visual,{question:item}),description=visuals.accessibleDescription(node.visual,{question:item});assert.doesNotMatch(initial,/undefined|NaN/);assert.doesNotMatch(description,/undefined|NaN/);if(!item)continue;assert.match(initial,/data-revealed="false"/);assert.doesNotMatch(initial,/Compare your working/);assert.match(description,/(not shown|missing value is not shown|determines the method)/i);assert.ok(Object.keys(item.response_feedback).length>=2);assert.notEqual(item.scripts.on_correct_reaction,item.scripts.on_incorrect_attempt_1);const worked=visuals.renderMarkup(node.visual,{question:item,feedback:'support',workingRevealed:1});assert.match(worked,/Compare your working/);assert.equal((worked.match(/<li>/g)||[]).length,1);}
assert.match(visuals.renderMarkup(model.getNode('T01').visual),/Known whole → part/);assert.match(visuals.renderMarkup(question('G01').visual,{question:question('G01')}),/54 ÷ \?/);assert.doesNotMatch(visuals.renderMarkup(question('G01').visual,{question:question('G01')}),/54 ÷ 9/);assert.match(visuals.renderMarkup(question('G01').visual,{question:question('G01'),feedback:'correct'}),/54 ÷ 9/);
assert.match(visuals.renderMarkup(question('P08').visual,{question:question('P08')}),/data-context="rice"/);assert.match(visuals.renderMarkup(question('X04').visual,{question:question('X04')}),/data-mixed-division-context="plank"/);assert.match(visuals.renderMarkup(question('X05').visual,{question:question('X05')}),/data-model-kind="multi_step"/);
function engine(){const lesson=new window.RevilyLessonEngine.LessonEngine({querySelector:()=>null},spec,{},{});lesson.elements={canvas:{setAttribute(){},removeAttribute(){},querySelector(){return null;},innerHTML:''},primary:{},ryan:null};lesson.lockInputs=()=>{};lesson.refocusInput=()=>{};lesson.stopNarration=()=>{};lesson.showFeedback=(...args)=>lesson.feedback=args;lesson.startNarration=(lines,done)=>{lesson.narrated=lines;lesson.narrationCallback=done;};lesson.readResponse=()=>lesson.testResponse;lesson.state=lesson.freshState();return lesson;}
for(const node of model.nodes.filter(node=>node.question&&!node.exit)){const item=node.question,wrong=item.response.type==='single_choice'?item.response.options.find(value=>value!==item.answer.value):'99999';for(const wrongCount of [0,1,2]){const lesson=engine();lesson.testResponse=wrong;for(let attempt=0;attempt<wrongCount;attempt++){lesson.submitAnswer(node);assert.equal(lesson.state.resolved[item.id],undefined);}lesson.testResponse=clone(item.answer.value);lesson.submitAnswer(node);assert.equal(lesson.state.resolved[item.id],wrongCount?'correct_after_support':'correct');}}
for(let mask=0;mask<64;mask++){const lesson=engine();model.exitIds.forEach((qid,index)=>{const node=model.nodes.find(candidate=>candidate.questionId===qid),item=node.question;lesson.testResponse=mask&(1<<index)?(item.response.type==='single_choice'?item.response.options.find(value=>value!==item.answer.value):'99999'):clone(item.answer.value);lesson.submitAnswer(node);});assert.equal(lesson.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');assert.equal(lesson.state.exit.confirmationId,null);}
assert.equal(fs.readFileSync(path.join(root,rel),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',rel),'utf8'));assert.equal(fs.readFileSync(path.join(root,'fractions/js/operation-structure-visuals.js'),'utf8'),fs.readFileSync(path.join(root,'revily-site/public/fractions/js/operation-structure-visuals.js'),'utf8'));
console.log('MD-17: all source active questions, four method families, guided blanks, independent mixed set, six unsupported finals, corrections and 64 mastery outcomes passed.');
