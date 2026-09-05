import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-10_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>String(storage.size)},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','fraction-share-visuals.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,share=window.RevilyFractionShareVisuals,validate=window.RevilyValidators.validate;
const question=short=>model.getQuestion('MD-10-'+short);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[9],manifest).length,0);
assert.equal(spec.spec_intent.source_material.sha256,'f3640bfc3e2b9497ee63acf856fabb3664fb97bf0b71d525520ab2ca891e45dd');
assert.equal(spec.question_bank.length,20);assert.equal(model.nodes.length,30);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);assert.equal(spec.diagnostic.enabled,false);
for(const [short,answer] of Object.entries({G01:'1/3',G02:'1/3',G03:'9/30',G04:'3/10',P01:'3/10',P02:'7/24',P03:'1/6',P04:'3/13',P05:'3/28',P06:'4/35',X01:'3/8',X02:'1/6',X03:'7/32',X04:'9/10 ÷ 3',E01:'7/24',E02:'3/16'}))assert.equal(question(short).answer.value,answer);
for(const node of model.nodes) {
  assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:node.question}),/NaN|undefined/);
  if(!node.question)continue;
  const q=node.question,initial=visuals.renderMarkup(node.visual,{question:q});
  assert.match(initial,/data-revealed="false"/);assert.match(initial,/data-compact-captions="true"/);assert.doesNotMatch(initial,/os-working/);
  assert.equal(validate(q,q.answer.value),true,q.id);assert.equal(validate(q,'99999'),false,q.id);
  assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
  assert.doesNotMatch(window.RevilyVisuals.mathMarkup(q.prompt),/aria-label="[^"]*over \d+\?/);
  assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
  for(const feedback of ['correct','support'])for(let shown=1;shown<=q.working.length;shown++)assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:q,feedback,workingRevealed:shown}),/NaN|undefined/);
}
assert.match(visuals.accessibleDescription(model.getNode('T01').visual),/3 over 4/);
assert.match(visuals.accessibleDescription(model.getNode('T02').visual),/6 over 8/);
assert.match(visuals.accessibleDescription(model.getNode('T03').visual),/2 equal shares, each 3 over 8/);
assert.match(visuals.accessibleDescription(model.getNode('T07').visual),/4 over one/);
assert.match(visuals.accessibleDescription(model.getNode('T08').visual),/Only the divisor changes/);
assert.match(visuals.accessibleDescription(model.getNode('T09').visual),/8 over 15 multiplied by one over 4/);
assert.match(visuals.accessibleDescription(model.getNode('T10').visual),/8 over 60/);
assert.match(visuals.accessibleDescription(model.getNode('T11').visual),/2 over 15/);
assert.match(visuals.accessibleDescription(question('C01').visual),/Given calculation.*equals 3 over 8/);
for(const short of ['G01','G02'])assert.doesNotMatch(visuals.accessibleDescription(question(short).visual),/one over 3/);
assert.match(visuals.accessibleDescription(question('G01').visual,{feedback:'support',workingRevealed:1}),/3 over one/);
assert.match(visuals.accessibleDescription(question('G01').visual,{feedback:'support',workingRevealed:2}),/one over 3/);
assert.equal(validate(question('G03'),'3/10'),false,'raw-product box keeps its explicit form requirement');
assert.equal(validate(question('G04'),'9/30'),false,'simplest-form box rejects an unfinished equivalent');
assert.equal(validate(question('G01'),'2/6'),true,'reciprocal setup has no simplest-form restriction');
for(const short of ['X01','X02','X03']) {
  const q=question(short),p=window.RevilyValidators.parseRational(q.answer.value);
  assert.equal(validate(q,`${p.n*2n}/${p.d*2n}`),true,'context source does not request simplest form');
  assert.ok(q.response.suffix);assert.doesNotMatch(visuals.accessibleDescription(q.visual),/divided|multiplied|reciprocal/);
  assert.doesNotMatch(visuals.renderMarkup(q.visual,{question:q}),/os-share-equation/);
}
assert.doesNotMatch(visuals.accessibleDescription(question('X04').visual,{feedback:'correct',workingRevealed:2}),/3 over 10/,'operation choice must not reveal the unasked numerical answer');
assert.match(visuals.renderMarkup(question('X01').visual,{feedback:'correct',workingRevealed:5}),/Original juice:/);
assert.equal((visuals.renderMarkup(question('X04').visual).match(/y="59"/g)||[]).length,3,'paint recipients are drawn smaller than the original container');
for(const short of ['E01','E02']) {
  const q=question(short),m=q.visual.model,p=window.RevilyValidators.parseRational(q.answer.value);
  assert.equal(validate(q,`${p.n*2n}/${p.d*2n}`),false);
  assert.equal(spec.question_bank.some(other=>other.stage!=='exit'&&['n','d','divisor'].every(key=>other.visual.model[key]===m[key])),false,'final fraction/divisor pair is fresh');
}
// The approved direct numerator method must not be misclassified as a misconception.
assert.equal(validate(question('P04'),'3/13'),true);
assert.doesNotMatch(spec.concept_model.common_confusions.join(' '),/dividing only the numerator/i);
for(let n=1;n<=17;n++)for(let d=2;d<=17;d++)for(let k=2;k<=12;k++) {
  const m={kind:'fraction_share',object:'symbolic',n,d,divisor:k},result=share.exactResult(m);
  assert.equal(window.RevilyValidators.sameRational(`${result.n*BigInt(k)}/${result.d}`,`${n}/${d}`),true);
  assert.ok(Number(result.n)/Number(result.d)<n/d);
  if(n<=d)assert.doesNotMatch(share.render({...m,phase:'partition'}),/NaN|undefined/);
}
const first=share.render({kind:'fraction_share',object:'bar',n:3,d:4,divisor:2,phase:'given'}),partition=share.render({kind:'fraction_share',object:'bar',n:3,d:4,divisor:2,phase:'partition'}),shared=share.render({kind:'fraction_share',object:'bar',n:3,d:4,divisor:2,phase:'shares'});
assert.equal((first.match(/data-selected="true"/g)||[]).length,3);
assert.equal((partition.match(/data-selected="true"/g)||[]).length,6);
assert.equal((partition.match(/data-share-cell/g)||[]).length,8);
assert.equal((shared.match(/class="os-share-bar"/g)||[]).length,3,'one original reference and two conserved shares');
assert.equal((shared.match(/data-selected="true"/g)||[]).length,12,'original six eighths plus two shares of three eighths');
const css=fs.readFileSync(path.join(root,'fractions/operation-structure.css'),'utf8');
assert.match(css,/\.os-share-object \{ width: 120px;/);
assert.match(css,/\.os-share-recipient \{ flex: 0 0 120px; width: 120px;/);
assert.match(css,/\.os-share-object \{ width: 100px;/);
assert.match(css,/\.os-share-recipient \{ flex-basis: 100px; width: 100px;/,'source and portions preserve the same diagram scale at phone widths');
for(const parts of [{n:0,d:2,divisor:2},{n:1,d:0,divisor:2},{n:1,d:2,divisor:0},{n:1,d:2,divisor:1.5}])assert.throws(()=>share.render(parts));
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
const unfinished=engine();unfinished.response='9/30';unfinished.submitAnswer(model.nodes.find(n=>n.questionId==='MD-10-G04'));assert.match(unfinished.feedback[1],/not yet in simplest form/);
const reversed=engine();reversed.response='10/9';reversed.submitAnswer(model.nodes.find(n=>n.questionId==='MD-10-G01'));assert.match(reversed.feedback[1],/first fraction instead/);
const unfinishedFinal=engine();unfinishedFinal.response='15/80';unfinishedFinal.submitAnswer(model.nodes.find(n=>n.questionId==='MD-10-E02'));assert.match(unfinishedFinal.feedback[1],/not yet in simplest form/);
for(let mask=0;mask<8;mask++){
  const e=engine();model.exitIds.forEach((qid,i)=>{const node=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?'99999':node.question.answer.value;e.submitAnswer(node);});assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
assert.equal(fs.readFileSync(path.join(root,relative),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',relative),'utf8'));
console.log('MD-10: source sequence and answers, 2992 exact sharing invariants, conserved reference bars, divisor-only reciprocal, raw/simplest/exact form distinctions, context concealment, all retry ladders and 8 mastery outcomes passed.');
