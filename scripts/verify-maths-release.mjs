import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../physics-release/',import.meta.url));
const ib=JSON.parse(fs.readFileSync(path.join(root,'ib-maths/library.json')));
const ig=JSON.parse(fs.readFileSync(path.join(root,'igcse-maths/practice-library.json')));
function assets(value,slug){
 if(!value||typeof value!=='object')return;
 if(typeof value.path==='string'&&/^(assets|practice)\//.test(value.path)){
  const file=path.resolve(root,slug,value.path);
  assert.ok(file.startsWith(path.join(root,slug)+path.sep),'Asset escapes subject directory');
  assert.ok(fs.existsSync(file),'Missing maths asset: '+file);
 }
 for(const child of Object.values(value))if(child&&typeof child==='object')assets(child,slug);
}
assets(ib,'ib-maths');assets(ig,'igcse-maths');
const {findQuestions,isReviewed}=await import(pathToFileURL(path.join(root,'ib-maths/search.js')));
const reviewed=findQuestions(ib,{course:'all',review:'verified',keyword:'',subtopics:ib.subtopics.map(s=>s.id)});
assert.equal(reviewed.length,30);assert.ok(reviewed.every(r=>isReviewed(r.question)));
assert.equal(ib.questions.length,6720);assert.equal(ib.papers.length,693);
const {findPractice,findArchive}=await import(pathToFileURL(path.join(root,'igcse-maths/practice-search.js')));
const {practiceCard}=await import(pathToFileURL(path.join(root,'igcse-maths/practice-render.js')));
const matches=findPractice(ig,{topics:ig.subtopics.map(s=>s.id)});
assert.equal(ig.questions.length,3041);assert.equal(findArchive(ig).length,142);
for(const [i,result] of matches.entries()){
 const html=practiceCard(result,i,ig);
 assert.equal((html.match(/class="help-toggle"/g)||[]).length,3);
 for(const m of html.matchAll(/src="([^"]+)"/g))assert.ok(fs.existsSync(path.join(root,'igcse-maths',m[1])));
}
for(const slug of ['ib-maths','igcse-maths']){
 const html=fs.readFileSync(path.join(root,slug,'index.html'),'utf8');
 for(const id of ['home','notes','selection','practice','papers'])assert.ok(html.includes('id="'+id+'-view"'));
 assert.ok(html.includes('Coming soon'));assert.ok(html.includes('href="/#subjects"'));
 assert.ok(!/<video\b|youtube\.com|vimeo\.com/.test(html));
}
console.log(JSON.stringify({maths:'verified',ibReviewed:reviewed.length,ibProvisional:ib.questions.length-reviewed.length,igcsePracticeQuestions:matches.length,igcseParts:ig.coverage.parts}));
