import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-14_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>String(storage.size)},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','fraction-group-visuals.js','mixed-division-visuals.js','conversion-product-workspace.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,mixed=window.RevilyMixedDivisionVisuals,workspace=window.RevilyConversionProduct,validate=window.RevilyValidators.validate;
const question=short=>model.getQuestion('MD-14-'+short),clone=value=>JSON.parse(JSON.stringify(value));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[13],manifest).length,0);
assert.equal(spec.spec_intent.source_material.sha256,'3b6cc779507e5a8e78bb569836e430c37c47d5a01d9c1d6b6c7baa54ee49ac0d');
assert.equal(spec.spec_intent.refinement.version,'MD14-source-aligned-1');
assert.equal(spec.spec_intent.refinement.source_review,'complete');
assert.match(spec.spec_intent.refinement.note,/inactive source entry key incorrectly labels its answer/);
assert.match(spec.spec_intent.refinement.note,/second source final intentionally repeats/);
assert.equal(spec.question_bank.length,20);assert.equal(model.nodes.length,30);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);assert.equal(spec.diagnostic.enabled,false);
for(const [short,answer] of Object.entries({G01:5,G02:'6/5',G03:'30/15',G04:2,P01:'5/2',P02:2,P03:'9/14',P04:'5/2',P05:3,P06:'5/2 × 3/5',X01:3,X02:4,X03:4,X04:'2 1/2 ÷ 5/8'}))assert.deepEqual(question(short).answer.value,answer);
assert.deepEqual(question('E01').answer.value,{conversions:[{n:8,d:5}],result:'2'});
assert.deepEqual(question('E02').answer.value,{conversions:[{n:9,d:4},{n:3,d:2}],result:'3/2'});
for(const node of model.nodes) {
  assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:node.question}),/NaN|undefined/);
  assert.doesNotMatch(visuals.accessibleDescription(node.visual,{question:node.question}),/NaN|undefined/);
  if(!node.question)continue;
  const q=node.question,initial=visuals.renderMarkup(node.visual,{question:q});
  assert.match(initial,/data-revealed="false"/);assert.match(initial,/data-compact-captions="true"/);assert.doesNotMatch(initial,/os-working/);
  if(q.response.type==='conversion_product')assert.equal(workspace.classify(q,q.answer.value),'correct',q.id);
  else {assert.equal(validate(q,q.answer.value),true,q.id);assert.equal(validate(q,'99999'),false,q.id);}
  assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
  assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
  for(const feedback of ['correct','support'])for(let shown=1;shown<=q.working.length;shown++) {
    assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:q,feedback,workingRevealed:shown}),/NaN|undefined/);
    assert.doesNotMatch(visuals.accessibleDescription(node.visual,{question:q,feedback,workingRevealed:shown}),/NaN|undefined/);
  }
}
assert.match(visuals.renderMarkup(model.getNode('T01').visual),/os-mdv-mixed-bars/);
assert.match(visuals.accessibleDescription(model.getNode('T01').visual),/1 1\/2/);
assert.match(visuals.renderMarkup(model.getNode('T02').visual),/os-fraction-groups/);
assert.match(visuals.accessibleDescription(model.getNode('T02').visual),/6 parts of size one over 4/);
assert.match(visuals.accessibleDescription(model.getNode('T03').visual),/2 groups of size 3 over 4/);
assert.match(visuals.accessibleDescription(model.getNode('T07').visual),/2 1\/4 equals 9 over 4/);
assert.match(visuals.accessibleDescription(model.getNode('T08').visual),/1 1\/2 equals 3 over 2/);
assert.match(visuals.accessibleDescription(model.getNode('T09').visual),/reciproc/i);
assert.match(visuals.accessibleDescription(model.getNode('T10').visual),/18 over 12/);
assert.match(visuals.accessibleDescription(model.getNode('T11').visual),/3 over 2/);
assert.match(visuals.renderMarkup(question('X01').visual),/data-length-kind="ribbon"/);
assert.match(visuals.renderMarkup(question('X02').visual),/data-vessel="jug"/);
assert.match(visuals.renderMarkup(question('X03').visual),/data-length-kind="plank"/);
assert.match(visuals.renderMarkup(question('X04').visual),/data-vessel="paint-can"/);
for(const short of ['X01','X02','X03','X04'])assert.doesNotMatch(visuals.accessibleDescription(question(short).visual),/Number of .*: [1-9]|makes [1-9]/i,'context visuals cannot reveal a scored count');
assert.doesNotMatch(visuals.accessibleDescription(question('X04').visual,{feedback:'correct',workingRevealed:2}),/equals 4|four tins/i,'operation choice does not reveal an unasked count');
const workedPair=visuals.modelFor(model.getNode('T06').visual,{});assert.equal(question('E02').visual.model.left.whole,workedPair.left.whole,'approved second final repeats the worked source pair');assert.equal(question('E02').visual.model.right.whole,workedPair.right.whole);
let conserved=0;
for(let whole=1;whole<=4;whole++)for(let d=2;d<=8;d++)for(let n=1;n<d;n++)for(let rd=2;rd<=8;rd++)for(let rn=1;rn<rd;rn++) {
  const item={kind:'mixed_division',left:{whole,n,d},right:{n:rn,d:rd}},p=mixed.exactResult(item),left=mixed.fraction(item.left),right=mixed.fraction(item.right);
  assert.equal(window.RevilyValidators.sameRational({n:p.n*right.n,d:p.d*right.d},left),true,'quotient multiplied by divisor must restore the converted dividend');conserved++;
}
assert.equal(conserved,3136);
for(const bad of [{left:{whole:1,n:2,d:2},right:{n:1,d:2}},{left:{whole:1,n:1,d:2},right:{n:0,d:2}},{left:{whole:-1,n:1,d:2},right:{n:1,d:2}}])assert.throws(()=>mixed.exactResult({kind:'mixed_division',...bad}));
const conversion=question('E02');assert.equal(workspace.classify(conversion,conversion.answer.value),'correct');
const equivalent=clone(conversion.answer.value);equivalent.conversions=[{n:18,d:8},{n:6,d:4}];equivalent.result={whole:1,n:1,d:2};assert.equal(workspace.classify(conversion,equivalent),'correct');
const omitted=clone(conversion.answer.value);omitted.conversions[0].n=1;assert.equal(workspace.classify(conversion,omitted),'omitted_whole');
const missing=clone(conversion.answer.value);missing.conversions.pop();assert.equal(workspace.classify(conversion,missing),'missing_conversion');
const wrong=clone(conversion.answer.value);wrong.conversions[1]={n:2,d:3};assert.equal(workspace.classify(conversion,wrong),'incorrect_conversion');
const unfinished=clone(conversion.answer.value);unfinished.result='6/4';assert.equal(workspace.classify(conversion,unfinished),'wrong_form');
const conversionMarkup=workspace.markup(conversion,null,false,final=>'<div data-final="'+final.response.type+'"></div>');assert.match(conversionMarkup,/Dividend conversion/);assert.match(conversionMarkup,/Divisor conversion/);assert.match(conversionMarkup,/data-final="fraction"/);
function engine(){
  const e=new window.RevilyLessonEngine.LessonEngine({querySelector:()=>null},spec,{},{});
  e.elements={canvas:{setAttribute(){},removeAttribute(){},querySelector(){return null;},innerHTML:''},primary:{},ryan:null};
  e.lockInputs=()=>{};e.refocusInput=()=>{};e.stopNarration=()=>{};e.showFeedback=(...args)=>e.feedback=args;e.startNarration=(lines,done)=>{e.lines=lines;e.done=done;};e.readResponse=()=>e.response;e.state=e.freshState();return e;
}
for(const node of model.nodes.filter(n=>n.question&&!n.exit&&!n.question.policy.engagementOnly))for(const wrongCount of [0,1,2]) {
  const e=engine();e.response=node.question.response.type==='conversion_product'?{conversions:[],result:null}:'99999';for(let i=0;i<wrongCount;i++){e.submitAnswer(node);assert.equal(e.state.resolved[node.questionId],undefined);}
  e.response=clone(node.question.answer.value);e.submitAnswer(node);assert.equal(e.state.resolved[node.questionId],wrongCount?'correct_after_support':'correct');
}
for(const node of model.nodes.filter(n=>n.question?.policy.engagementOnly)) {
  const good=engine(),bad=engine();good.response=node.question.answer.value;bad.response='99999';good.submitAnswer(node);bad.submitAnswer(node);assert.notEqual(good.feedback[1],bad.feedback[1]);assert.equal(bad.state.evidence.firstAttemptCorrect[node.questionId],undefined);
}
for(let mask=0;mask<8;mask++) {
  const e=engine();model.exitIds.forEach((qid,i)=>{const node=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?(node.question.response.type==='conversion_product'?{conversions:[],result:null}:'99999'):clone(node.question.answer.value);e.submitAnswer(node);});assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
const e=engine();assert.match(e.inputMarkup(question('E01'),null,false),/os-conversion-working/);assert.match(e.inputMarkup(question('E01'),null,false),/integer-answer/);assert.match(e.inputMarkup(question('E02'),null,false),/fraction-input/);
assert.equal(fs.readFileSync(path.join(root,relative),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',relative),'utf8'));
console.log('MD-14: source sequence and answers, mixed-number conversion evidence, 3,136 conserved division models, distinct contexts, correction ladders and all 8 mastery outcomes passed.');
