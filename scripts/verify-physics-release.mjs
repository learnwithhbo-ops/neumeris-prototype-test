import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url));
const root=path.resolve(process.argv[2]??path.join(repo,'physics-release'));
const manifest=JSON.parse(fs.readFileSync(process.argv[3]??path.join(repo,'physics-release-manifest.json')));
const selected=new Set(Object.keys(manifest.files));let bytes=0;
for(const [rel,expected] of Object.entries(manifest.files)){
  const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep))throw new Error('Invalid release path '+rel);
  const body=fs.readFileSync(file);if(body.length!==expected.bytes||crypto.createHash('sha256').update(body).digest('hex')!==expected.sha256)throw new Error('Release checksum mismatch: '+rel);bytes+=body.length;
}
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(!selected.has(path.relative(root,file).split(path.sep).join('/')))throw new Error('Unlisted public file: '+file);}}walk(root);
function checkReference(from,reference){
  if(!reference||/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference))return;
  const url=new URL(reference,'https://release.invalid/'+from);let rel=decodeURIComponent(url.pathname).slice(1);if(!rel||rel.endsWith('/'))rel+='index.html';
  if(!selected.has(rel))throw new Error('Missing published reference: '+from+' → '+reference);
}
for(const rel of selected){
  if(!/\.(html|css|js)$/.test(rel))continue;const text=fs.readFileSync(path.join(root,rel),'utf8');
  if(rel.endsWith('.html'))for(const m of text.matchAll(/(?:src|href)="([^"]+)"/g))checkReference(rel,m[1]);
  if(rel.endsWith('.css'))for(const m of text.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g))checkReference(rel,m[1]);
  if(rel.endsWith('.js'))for(const m of text.matchAll(/(?:from\s*|import\s*\(\s*)['"](\.[^'"]+)['"]/g))checkReference(rel,m[1]);
}
for(const forbidden of ['focused-library.json','supplementary-library.json','supplementary-written.json','cross-board-library.json','question-guidance.json','question-presentation.json','question-answers.json','topic-bridges.json','topical-adjustments.json','topical-curation.json'])if(selected.has(forbidden))throw new Error('Authoring bank must not ship: '+forbidden);
const catalog=JSON.parse(fs.readFileSync(path.join(root,'numeris-catalog.json'))),lesson=JSON.parse(fs.readFileSync(path.join(root,'learn/greenhouse-effect/catalog.json')));
if(catalog.contentVersion!==lesson.content_version||lesson.presentation!=='reading')throw new Error('Incorrect lesson release.');
for(const paper of catalog.papers){checkReference('index.html',paper.url);if(paper.markUrl)checkReference('index.html',paper.markUrl);}
const {createPracticeLoader}=await import(pathToFileURL(path.join(root,'practice-loader.js'))),{findQuestions}=await import(pathToFileURL(path.join(root,'focused-search.js'))),{focusedCard}=await import(pathToFileURL(path.join(root,'focused-render.js')));
const loader=createPracticeLoader(async url=>{checkReference('index.html',url);return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url)))};});
const index=await loader.menu();checkReference('index.html',index.search);
if(index.questions.some(q=>q.parts.some(p=>p.review_status!=='reviewed')))throw new Error('Provisional part in public practice index.');
const matches=findQuestions(index,{subtopics:index.subtopics.map(s=>s.id),course:'all'}),loaded=await loader.questions(matches);
for(const [i,result] of loaded.results.entries()){
  const html=focusedCard(result,i,loaded.data);for(const m of html.matchAll(/src="([^"]+)"/g))checkReference('index.html',m[1]);
  if(html.includes('not available yet'))throw new Error('Missing answer in '+result.question.id);
}
const {scientificFigures}=await import(pathToFileURL(path.join(root,'learn/greenhouse-effect/figure-catalog.js')));
for(const figure of Object.values(scientificFigures))checkReference('learn/greenhouse-effect/index.html',figure.src);
console.log(JSON.stringify({files:selected.size,bytes,papers:catalog.papers.length,lessons:catalog.lessons.length,practiceQuestions:matches.length,questionPacks:index.packUrls.length,status:'verified'}));
await import('./verify-maths-release.mjs');
const {verifyOriginals}=await import('./verify-originals.mjs');
console.log(JSON.stringify({...await verifyOriginals(root),status:'originals-verified'}));
