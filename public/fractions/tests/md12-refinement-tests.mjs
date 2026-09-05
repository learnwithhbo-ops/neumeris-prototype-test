import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-12_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>String(storage.size)},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','proper-group-visuals.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,groups=window.RevilyProperGroupVisuals,validate=window.RevilyValidators.validate;
const question=short=>model.getQuestion('MD-12-'+short);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[11],manifest).length,0);
assert.equal(spec.spec_intent.source_material.sha256,'725da155e7924da896ebc00ce7c857e7337434534d814e9d5c0d07ce0d17ee82');
assert.equal(spec.question_bank.length,20);assert.equal(model.nodes.length,28);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);assert.equal(spec.diagnostic.enabled,false);
for(const [short,answer] of Object.entries({G01:'6/1',G02:'5/3',G03:'30/3',G04:10,P01:6,P02:15,P03:'35/2',P04:18,P05:'18/5',P06:'25/2',X01:8,X02:12,X03:12,X04:'9 ÷ 3/5',E01:10,E02:'21/2'}))assert.equal(question(short).answer.value,answer);
for(const node of model.nodes) {
  assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:node.question}),/NaN|undefined/);
  if(!node.question)continue;
  const q=node.question,initial=visuals.renderMarkup(node.visual,{question:q});
  assert.match(initial,/data-revealed="false"/);assert.match(initial,/data-compact-captions="true"/);assert.doesNotMatch(initial,/os-working/);
  assert.equal(validate(q,q.answer.value),true,q.id);assert.equal(validate(q,'99999'),false,q.id);
  assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
  assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
  for(const feedback of ['correct','support'])for(let shown=1;shown<=q.working.length;shown++)assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:q,feedback,workingRevealed:shown}),/NaN|undefined/);
}
assert.match(visuals.accessibleDescription(model.getNode('T02').visual),/12 equal parts/);
assert.match(visuals.accessibleDescription(model.getNode('T03').visual),/6 groups of size 2 over 3/);
assert.match(visuals.accessibleDescription(model.getNode('T04').visual),/Both divisor numbers matter/);
assert.match(visuals.accessibleDescription(model.getNode('T09').visual),/17 whole groups and 1 over 2/);
assert.equal(validate(question('G01'),'12/2'),false);assert.equal(validate(question('G01'),'6/1'),true);
assert.equal(validate(question('G02'),'10/6'),true);
assert.equal(validate(question('G03'),'10/1'),false);assert.equal(validate(question('G03'),'60/6'),false);assert.equal(validate(question('G03'),'30/3'),true);
assert.doesNotMatch(visuals.accessibleDescription(question('G03').visual),/30/);
assert.doesNotMatch(visuals.accessibleDescription(question('G03').visual,{feedback:'support',workingRevealed:1}),/30/);
assert.match(visuals.accessibleDescription(question('G03').visual,{feedback:'support',workingRevealed:2}),/Raw product 30 over 3/);
for(const [short,mixed] of [['P03','17 1/2'],['P05','3 3/5'],['E02','10 1/2']]) {
 const q=question(short),parts=mixed.match(/(\d+) (\d+)\/(\d+)/);
 assert.equal(validate(q,mixed),true);assert.equal(validate(q,{whole:parts[1],n:parts[2],d:parts[3]}),true);
 assert.equal(validate(q,{whole:parts[1],n:Number(parts[2])*2,d:Number(parts[3])*2}),false);
 assert.equal(validate(q,{whole:0,n:q.answer.value.split('/')[0],d:q.answer.value.split('/')[1]}),false,'an improper fractional part is not a simplest mixed number');
}
for(const short of ['P01','P02','P04','E01']) {
 const q=question(short);assert.equal(validate(q,q.answer.value+'/1'),true);assert.equal(validate(q,q.answer.value*2+'/2'),false,'explicit simplest form rejects an unreduced whole-value fraction');
}
for(const short of ['X01','X02','X03']) {
 const q=question(short);assert.equal(validate(q,q.answer.value*2+'/2'),true);assert.equal(q.response.suffix,undefined,'counts do not carry the quantity unit');
 assert.doesNotMatch(visuals.accessibleDescription(q.visual),/divid|multipl|reciprocal/i);
}
assert.equal((groups.render({...question('X01').visual.model,phase:'simplified'}).match(/data-proper-piece/g)||[]).length,8);
for(const short of ['X02','X03'])assert.equal((groups.render({...question(short).visual.model,phase:'simplified'}).match(/data-proper-recipient/g)||[]).length,12);
assert.match(visuals.renderMarkup(question('X02').visual),/os-pg-water/);assert.match(visuals.renderMarkup(question('X03').visual),/os-pg-flour/);
assert.doesNotMatch(visuals.accessibleDescription(question('X04').visual,{feedback:'correct',workingRevealed:2}),/15/);
for(const short of ['E01','E02']) {
 const m=question(short).visual.model;
 assert.equal(spec.question_bank.some(q=>q.stage!=='exit'&&q.visual.model.wholes===m.wholes&&q.visual.model.n===m.n&&q.visual.model.d===m.d),false);
}
let combinations=0;
for(let w=2;w<=12;w++)for(let d=3;d<=12;d++)for(let n=2;n<d;n++) {
 const m={kind:'proper_groups',object:'bars',wholes:w,n,d},p=groups.exact(m),counted=groups.render({...m,phase:'grouped'}),small=groups.render({...m,phase:'small_parts'});
 assert.equal((counted.match(/data-proper-small-part/g)||[]).length,w*d,'regrouping conserves every small part');
 assert.equal((small.match(/data-proper-small-part/g)||[]).length,w*d);
 assert.ok(counted.includes('style="width:'+100*n/d+'%;'),'a complete group keeps its numerator/denominator share of the reference width');
 assert.ok(small.includes('style="width:100%;'),'one whole retains the full reference width');
 assert.equal((counted.match(/os-pg-complete-group/g)||[]).length,Math.floor(w*d/n));
 assert.equal((counted.match(/os-pg-partial-group/g)||[]).length,w*d%n?1:0);
 assert.equal(p.n*BigInt(n),BigInt(w*d)*p.d);assert.ok(p.n>BigInt(w)*p.d);
 combinations++;
}
assert.equal(combinations,605);
assert.throws(()=>groups.render({wholes:6,n:3,d:3}));assert.throws(()=>groups.render({wholes:6,n:1,d:3}));
assert.throws(()=>groups.render({wholes:3,n:2,d:3,object:'water',phase:'simplified'}),'partial full bottles cannot be silently rounded');
function engine(){
 const e=new window.RevilyLessonEngine.LessonEngine({querySelector:()=>null},spec,{},{});
 e.elements={canvas:{setAttribute(){},removeAttribute(){},querySelector(){return null;},innerHTML:''},primary:{},ryan:null};
 e.lockInputs=()=>{};e.refocusInput=()=>{};e.stopNarration=()=>{};e.showFeedback=(...args)=>e.feedback=args;
 e.startNarration=(lines,done)=>{e.lines=lines;e.done=done;};e.readResponse=()=>e.response;e.state=e.freshState();return e;
}
for(const node of model.nodes.filter(n=>n.question&&!n.exit&&!n.question.policy.engagementOnly))for(const wrongCount of [0,1,2,3]) {
 const e=engine();e.response='99999';for(let i=0;i<wrongCount;i++){e.submitAnswer(node);assert.equal(e.state.resolved[node.questionId],undefined);}
 if(wrongCount)assert.equal(e.elements.canvas.innerHTML.includes('os-working'),wrongCount>=2);
 e.response=node.question.answer.value;e.submitAnswer(node);assert.equal(e.state.resolved[node.questionId],wrongCount?'correct_after_support':'correct');
}
for(const node of model.nodes.filter(n=>n.question?.policy.engagementOnly)) {
 const good=engine(),bad=engine();good.response=node.question.answer.value;bad.response='99999';good.submitAnswer(node);bad.submitAnswer(node);
 assert.notEqual(good.feedback[1],bad.feedback[1]);assert.equal(bad.state.engagementResponses[node.questionId].correct,null);
}
const raw=engine();raw.response='60/6';raw.submitAnswer(model.nodes.find(n=>n.questionId==='MD-12-G03'));assert.match(raw.feedback[1],/correct value/);assert.doesNotMatch(raw.feedback[1],/correct simplified/);
const unfinishedWhole=engine();unfinishedWhole.response='40/4';unfinishedWhole.submitAnswer(model.nodes.find(n=>n.questionId==='MD-12-E01'));assert.match(unfinishedWhole.feedback[1],/not yet in simplest form/);
for(let mask=0;mask<8;mask++) {
 const e=engine();model.exitIds.forEach((qid,i)=>{const node=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?'99999':node.question.answer.value;e.submitAnswer(node);});assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
const e=engine();assert.match(e.inputMarkup(question('E01'),null,false),/integer-answer/);assert.match(e.inputMarkup(question('E02'),null,false),/fraction or mixed number in simplest form/);
assert.equal(validate({response:{type:'integer',accept_exact_equivalents:true},answer:{value:10}},'40/4'),true,'integer aliases without the new form flag remain unchanged');
assert.equal(validate({response:{type:'fraction',allow_mixed_number:true},answer:{value:'21/2'}},{whole:10,n:2,d:4}),true,'unconstrained exact mixed forms remain accepted');
for(const file of [relative,'fractions/js/proper-group-visuals.js','fractions/js/validators.js','fractions/js/source-aligned-engine-profile.js'])assert.equal(fs.readFileSync(path.join(root,file),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',file),'utf8'));
console.log('MD-12: approved answers and sequence, 605 conserved regroupings, divisor numerator roles, raw/simplest/mixed forms, exact integer aliases, context counts, retry ladders and all eight mastery outcomes passed.');
