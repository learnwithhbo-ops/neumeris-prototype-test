import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),relative='CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-09_COMPLETE_v1.2.yaml';
const spec=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={location:{search:''},localStorage,crypto:{randomUUID:()=>String(storage.size)},setTimeout,clearTimeout};window.window=window;
const context=vm.createContext({window,localStorage,console,URLSearchParams,setTimeout,clearTimeout,document:{hidden:false,addEventListener(){},removeEventListener(){},body:{contains:()=>false}}});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,'fractions/js',file),'utf8'),context,{filename:file});
for(const file of ['validators.js','lesson-model.js','topics.js','reciprocal-visuals.js','operation-structure-visuals.js','visual-primitives.js','skill-loader.js'])load(file);
window.RevilyNarrationSync={NarrationSync:class{stop(){}}};load('lesson-engine.js');load('source-aligned-engine-profile.js');
const model=window.RevilyLessonModel.buildLessonModel(spec),visuals=window.RevilyOperationVisuals,validate=window.RevilyValidators.validate;
const question=short=>model.getQuestion('MD-09-'+short);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'),'utf8'));
assert.equal(window.RevilySkillLoader.inspectSkill(spec,manifest.skills[8],manifest).length,0);
assert.equal(spec.spec_intent.source_material.sha256,'6b5ff1870f78fab16a77f5a3ed22fd11ba564c70430c6b3f2f534aa39f225485');
assert.equal(spec.question_bank.length,19);assert.equal(model.nodes.length,33);assert.equal(model.exitIds.length,3);assert.equal(model.confirmationIds.length,0);assert.equal(spec.diagnostic.enabled,false);
for(const [short,answer] of Object.entries({G01:'9/4',G02:1,G03:'1/8',P01:'7/2',P02:'4/11',P03:'1/9',P04:6,P05:1,P06:'1/12',X01:'9/4',X02:'1/6',X03:'7/5',X04:'8/3',E01:'12/5',E02:'1/7'}))assert.equal(question(short).answer.value,answer);
for(const node of model.nodes) {
  assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:node.question}),/NaN|undefined<\/text>/);
  if(!node.question)continue;
  const q=node.question,initial=visuals.renderMarkup(node.visual,{question:q});
  assert.match(initial,/data-revealed="false"/);assert.match(initial,/data-compact-captions="true"/);assert.doesNotMatch(initial,/os-working/);
  assert.equal(validate(q,q.answer.value),true,q.id);assert.equal(validate(q,'99999'),false,q.id);
  assert.notEqual(q.scripts.on_correct_reaction,q.scripts.on_incorrect_attempt_1);
  assert.doesNotMatch(window.RevilyVisuals.mathMarkup(q.prompt),/aria-label="[^"]*over \d+\?/,'sentence punctuation must stay outside fraction labels');
  assert.doesNotMatch(q.scripts.on_correct_reaction,/[×÷=→]/);
  for(const feedback of ['correct','support'])for(let shown=1;shown<=q.working.length;shown++)assert.doesNotMatch(visuals.renderMarkup(node.visual,{question:q,feedback,workingRevealed:shown}),/NaN|undefined<\/text>/);
}
assert.match(visuals.accessibleDescription(model.getNode('T02').visual),/numerator 3 moves to the denominator; the denominator 5 moves to the numerator/);
assert.match(visuals.accessibleDescription(model.getNode('T03').visual),/15 over 15, which is one/);
assert.match(visuals.accessibleDescription(model.getNode('T04').visual),/whole number 4 written as 4 over one/);
assert.match(visuals.accessibleDescription(model.getNode('T05').visual),/Reciprocal 1 over 4/);
assert.match(visuals.accessibleDescription(model.getNode('T07').visual),/zero, never one/);
assert.match(visuals.accessibleDescription(model.getNode('T08').visual),/undefined; it is not a valid reciprocal/);
assert.match(visuals.accessibleDescription(model.getNode('T11').visual),/Reciprocal 12 over 7/);
assert.match(visuals.accessibleDescription(model.getNode('T14').visual),/Reciprocal 1 over 6/);
assert.doesNotMatch(visuals.accessibleDescription(question('C01').visual),/product|multipl/i);
assert.doesNotMatch(visuals.renderMarkup(question('G02').visual),/Reciprocal:|>1<\/text>/);
assert.match(visuals.accessibleDescription(question('G02').visual),/fraction form is not shown/);
assert.doesNotMatch(visuals.accessibleDescription(question('G03').visual),/Reciprocal 1 over 8/);
assert.doesNotMatch(visuals.accessibleDescription(question('X03').visual),/7 over 5|reciprocal/);
assert.doesNotMatch(visuals.renderMarkup(question('X04').visual),/Reciprocal:/);
assert.match(visuals.renderMarkup(question('X03').visual),/First multiplier/);
assert.match(visuals.accessibleDescription(question('X03').visual,{feedback:'correct',workingRevealed:2}),/second multiplier 7 over 5/);
assert.doesNotMatch(visuals.accessibleDescription(question('X03').visual,{feedback:'correct',workingRevealed:2}),/moves/);
assert.match(visuals.accessibleDescription(question('X04').visual,{feedback:'correct'}),/another name for reciprocal/);
for(const short of ['C02','G01']) {
  assert.doesNotMatch(visuals.accessibleDescription(question(short).visual,{feedback:'support',workingRevealed:1}),/moves|Reciprocal \d/);
  assert.match(visuals.accessibleDescription(question(short).visual,{feedback:'support',workingRevealed:2}),/moves/);
  assert.match(visuals.accessibleDescription(question(short).visual,{feedback:'support',workingRevealed:3}),/which is one/);
}
assert.match(visuals.accessibleDescription(question('G02').visual,{feedback:'support',workingRevealed:1}),/fraction form is not shown/);
assert.match(visuals.accessibleDescription(question('G02').visual,{feedback:'support',workingRevealed:2}),/8 over one/);
assert.match(visuals.accessibleDescription(question('G04').visual,{feedback:'support',workingRevealed:1}),/multiplicative relationship/);
for(const [short,result] of [['E01','12/5'],['E02','1/7']]) {
  const q=question(short),parts=q.visual.model;
  assert.equal(spec.question_bank.some(other=>other.stage!=='exit'&&other.visual.model.kind==='reciprocal'&&other.visual.model.n===parts.n&&other.visual.model.d===parts.d),false);
  assert.equal(validate(q,result),true);assert.equal(validate(q,'0'),false);assert.equal(validate(q,'1/0'),false);
}
for(const response of ['24/10','2 2/5',{whole:'2',n:'2',d:'5'}])assert.equal(validate(question('E01'),response),true);
for(const response of ['-12/5','5/12','2.39999'])assert.equal(validate(question('E01'),response),false);
assert.equal(validate(question('P03'),'2/18'),true);assert.equal(validate(question('P03'),'9/1'),false);
assert.equal(validate(question('P04'),'12/2'),true);assert.equal(validate(question('P05'),'8/8'),true);
assert.equal(validate({response:{type:'integer'},answer:{value:6}},'12/2'),false,'ordinary integer-only fields retain their existing validation');
for(let n=1;n<=13;n++)for(let d=1;d<=13;d++) {
  const m={kind:'reciprocal',n,d,whole:d===1},initial=window.RevilyReciprocalVisuals.render(m);
  assert.doesNotMatch(initial,/os-recip-down|os-recip-up|Check by multiplication/);
  const swapped=window.RevilyReciprocalVisuals.render({...m,phase:'exchange'});
  assert.match(swapped,/os-recip-down/);assert.match(swapped,/os-recip-up/);
  assert.match(swapped,/os-recip-narrow/);assert.match(swapped,/viewBox="0 0 300 /);
  assert.equal(window.RevilyValidators.sameRational(n*d+'/'+(d*n),'1'),true);
  assert.match(window.RevilyReciprocalVisuals.accessible({...m,phase:'check'}),/which is one/);
}
for(const parts of [{n:0,d:1},{n:1,d:0},{n:-1,d:3},{n:1.5,d:2}])assert.throws(()=>window.RevilyReciprocalVisuals.render(parts));
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
const negative=engine();negative.response={n:'-4',d:'9'};negative.submitAnswer(model.nodes.find(n=>n.questionId==='MD-09-G01'));assert.match(negative.feedback[1],/Changing the sign/);
const unchanged=engine();unchanged.response={n:'4',d:'9'};unchanged.submitAnswer(model.nodes.find(n=>n.questionId==='MD-09-G01'));assert.match(unchanged.feedback[1],/unchanged/);
const denominator=engine();denominator.response='8';denominator.submitAnswer(model.nodes.find(n=>n.questionId==='MD-09-G02'));assert.match(denominator.feedback[1],/one, not eight/);
for(let mask=0;mask<8;mask++){
  const e=engine();model.exitIds.forEach((qid,i)=>{const node=model.nodes.find(n=>n.questionId===qid);e.response=mask&(1<<i)?'99999':node.question.answer.value;e.submitAnswer(node);});assert.equal(e.state.masteryState,mask?'LEARNING':'READY_FOR_RETRIEVAL');
}
const inputs=engine(),g02input=inputs.inputMarkup(question('G02'),null,false);assert.match(g02input,/Fixed numerator 8/);assert.doesNotMatch(g02input,/value="1"/);
for(const short of ['P04','P05']){assert.match(inputs.inputMarkup(question(short),null,false),/integer-answer/);assert.doesNotMatch(inputs.inputMarkup(question(short),null,false),/fraction-input/);}
const fields={'#fraction-n':{value:'-4'},'#fraction-d':{value:'9'},'#os-whole-label':{hidden:true},'#os-answer-whole':{value:''}};
inputs.root={querySelector:selector=>fields[selector]};const read=window.RevilyLessonEngine.LessonEngine.prototype.readResponse.bind(inputs);
assert.equal(JSON.stringify(read(question('G01'))),JSON.stringify({n:'-4',d:'9'}));
assert.equal(read({...question('G01'),response:{...question('G01').response,allow_signed_parts:false}}),null,'signed-input permission is property-gated');
fields['#fraction-d'].value='0';assert.equal(read(question('G01')),null);
fields['#integer-answer']={value:'6/1'};assert.equal(read(question('P04')),'6/1');assert.equal(validate(question('P04'),read(question('P04'))),true);
assert.equal(fs.readFileSync(path.join(root,relative),'utf8'),fs.readFileSync(path.join(root,'revily-site/public',relative),'utf8'));
console.log('MD-09: source answers and sequence, 169 reciprocal exchanges, zero/one cases, whole-number setup, exact equivalents, signed-error handling, all retry ladders, unscored responses and all 8 mastery outcomes passed.');
