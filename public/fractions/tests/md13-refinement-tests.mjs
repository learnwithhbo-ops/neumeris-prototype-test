import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-13_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>String(storage.size)},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','fraction-group-visuals.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,groups=window.RevilyFractionGroupVisuals,validate=window.RevilyValidators.validate;
const question=short=>model.getQuestion('MD-13-'+short);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[12],manifest).length,0);
assert.equal(spec.spec_intent.source_material.sha256,'61fe4df64f8cc1fcfcacb9aaaaa5e8d76be2f0e05a68d8a66345ca9d8a3bf426');
assert.equal(spec.question_bank.length,20);assert.equal(model.nodes.length,29);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);assert.equal(spec.diagnostic.enabled,false);
for(const [short,answer] of Object.entries({G01:4,G02:4,G03:'28/8',G04:'7/2',P01:'6/5',P02:'7/6',P03:'2/3',P04:6,P05:'3/4',P06:'6/5',X01:6,X02:4,X03:4,X04:'5/6 ÷ 1/12',E01:'21/10',E02:'9/16'}))assert.equal(question(short).answer.value,answer);
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
const original=visuals.renderMarkup(model.getNode('T01').visual),repartition=visuals.renderMarkup(model.getNode('T02').visual),grouped=visuals.renderMarkup(model.getNode('T03').visual);
assert.equal((original.match(/data-fraction-part="selected"/g)||[]).length,3);assert.equal((original.match(/data-fraction-part="empty"/g)||[]).length,1);
assert.equal((repartition.match(/data-fraction-part="selected"/g)||[]).length,6);assert.equal((repartition.match(/data-fraction-part="empty"/g)||[]).length,2);
assert.equal((grouped.match(/data-fraction-group="0"/g)||[]).length,3);assert.equal((grouped.match(/data-fraction-group="1"/g)||[]).length,3);
assert.match(grouped,/width:37.5%/);assert.match(visuals.accessibleDescription(model.getNode('T03').visual),/2 groups of size 3 over 8/);
assert.match(visuals.accessibleDescription(model.getNode('T10').visual),/1 whole and 1 over 4/);
assert.equal(validate(question('G01'),'4/1'),true);assert.equal(validate(question('G01'),'8/2'),true);assert.equal(validate(question('G01'),'1/4'),false);
assert.equal(validate(question('G03'),'7/2'),false);assert.equal(validate(question('G03'),'14/4'),false);
assert.doesNotMatch(visuals.accessibleDescription(question('G03').visual,{feedback:'support',workingRevealed:1}),/28/);
assert.match(visuals.accessibleDescription(question('G03').visual,{feedback:'support',workingRevealed:2}),/Raw fraction 28 over 8/);
assert.equal(validate(question('G04'),'3 1/2'),true);assert.equal(validate(question('G04'),'28/8'),false);
assert.equal(validate(question('E01'),'2 1/10'),true);assert.equal(validate(question('E01'),'42/20'),false);
assert.equal(validate(question('E02'),'18/32'),false);
assert.match(visuals.accessibleDescription(question('P03').visual,{feedback:'correct',workingRevealed:4}),/below one and the result is larger/);
for(const short of ['P05','E02'])assert.match(visuals.accessibleDescription(question(short).visual,{feedback:'correct',workingRevealed:4}),/above one and the result is smaller/);
for(const [short,count] of [['X01',6],['X02',4],['X03',4]]) {
 const q=question(short),html=visuals.renderMarkup(q.visual,{feedback:'correct',workingRevealed:4});
 assert.equal(validate(q,count*2+'/2'),true);assert.equal(q.response.suffix,undefined);
 assert.doesNotMatch(visuals.accessibleDescription(q.visual),/divid|multipl|reciprocal/i);
 assert.equal((html.match(short==='X03'?/data-fraction-piece/g:/data-fraction-recipient/g)||[]).length,count);
}
assert.match(visuals.renderMarkup(question('X01').visual),/os-fg-juice/);assert.match(visuals.renderMarkup(question('X02').visual),/os-fg-rice/);
assert.match(visuals.renderMarkup(question('X03').visual),/width:87.5%/);assert.match(visuals.renderMarkup(question('X03').visual),/width:21.875%/);
assert.doesNotMatch(visuals.accessibleDescription(question('X04').visual,{feedback:'correct',workingRevealed:2}),/10|ten/);
for(const short of ['E01','E02']) {
 const m=question(short).visual.model;
 assert.equal(spec.question_bank.some(q=>q.stage!=='exit'&&['a','b','c','d'].every(k=>q.visual.model[k]===m[k])),false);
}
let combinations=0;
for(let a=1;a<=15;a++)for(let b=1;b<=15;b++)for(let c=1;c<=15;c++)for(let d=1;d<=15;d++) {
 const p=groups.exact({a,b,c,d});
 assert.equal(p.n*BigInt(b*c),p.d*BigInt(a*d),'quotient times divisor restores the original amount');
 const comparison=p.n*BigInt(b)-BigInt(a)*p.d;
 assert.equal(comparison===0n,c===d);assert.equal(comparison>0n,c<d);assert.equal(comparison<0n,c>d);combinations++;
}
assert.equal(combinations,50625);
assert.throws(()=>groups.exact({a:1,b:2,c:0,d:3}));assert.throws(()=>groups.exact({a:1,b:0,c:2,d:3}));
assert.throws(()=>groups.render({a:3,b:4,c:1,d:2,object:'juice',phase:'simplified'}),'a complete-cup count cannot be rounded');
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
const invalidMethod=engine(),method=model.nodes.find(n=>n.questionId==='MD-13-C02');invalidMethod.response=method.question.response.options[3];invalidMethod.submitAnswer(method);assert.match(invalidMethod.feedback[1],/final value alone does not/);assert.equal(invalidMethod.state.engagementResponses[method.questionId].matched,false);
const raw=engine();raw.response='14/4';raw.submitAnswer(model.nodes.find(n=>n.questionId==='MD-13-G03'));assert.match(raw.feedback[1],/correct value/);
const unfinished=engine();unfinished.response='18/32';unfinished.submitAnswer(model.nodes.find(n=>n.questionId==='MD-13-E02'));assert.match(unfinished.feedback[1],/not yet in simplest form/);
for(let mask=0;mask<8;mask++) {
 const e=engine();model.exitIds.forEach((qid,i)=>{const node=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?'99999':node.question.answer.value;e.submitAnswer(node);});assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
for(const file of [relative,'fractions/js/fraction-group-visuals.js','fractions/js/operation-structure-visuals.js'])assert.equal(fs.readFileSync(path.join(root,file),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',file),'utf8'));
console.log('MD-13: source sequence and answers, 50,625 exact quotient/size invariants, conserved eighths, invalid-method rejection, raw/simplest/mixed forms, context counts, retry ladders and all eight mastery outcomes passed.');
