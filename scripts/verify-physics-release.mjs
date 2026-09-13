import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const repo=fileURLToPath(new URL('../',import.meta.url));
const root=path.join(repo,'physics-release');
const manifest=JSON.parse(fs.readFileSync(path.join(repo,'physics-release-manifest.json'),'utf8'));
const selected=new Set(Object.keys(manifest.files));
let bytes=0;
for(const [rel,expected] of Object.entries(manifest.files)){
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep))throw new Error('Invalid release path: '+rel);
  const body=fs.readFileSync(file);
  if(body.length!==expected.bytes||crypto.createHash('sha256').update(body).digest('hex')!==expected.sha256)throw new Error('Release checksum mismatch: '+rel);
  bytes+=body.length;
}
function checkReference(from,reference){
  if(!reference||/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference))return;
  const url=new URL(reference,'https://release.invalid/'+from);
  let rel=decodeURIComponent(url.pathname).slice(1);
  if(!rel||rel.endsWith('/'))rel+='index.html';
  if(!selected.has(rel))throw new Error('Missing published reference: '+from+' → '+reference);
}
for(const rel of selected){
  if(!/\.(html|css|js)$/.test(rel))continue;
  const text=fs.readFileSync(path.join(root,rel),'utf8');
  if(rel.endsWith('.html'))for(const match of text.matchAll(/(?:src|href)="([^"]+)"/g))checkReference(rel,match[1]);
  if(rel.endsWith('.css'))for(const match of text.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g))checkReference(rel,match[1]);
  if(rel.endsWith('.js'))for(const match of text.matchAll(/(?:from\s*|import\s*\(\s*)['"](\.[^'"]+)['"]/g))checkReference(rel,match[1]);
}
const catalog=JSON.parse(fs.readFileSync(path.join(root,'numeris-catalog.json'),'utf8'));
const lesson=JSON.parse(fs.readFileSync(path.join(root,'learn/greenhouse-effect/catalog.json'),'utf8'));
if(catalog.contentVersion!==lesson.content_version||lesson.presentation!=='reading')throw new Error('Incorrect lesson release.');
for(const paper of catalog.papers){checkReference('index.html',paper.url);if(paper.markUrl)checkReference('index.html',paper.markUrl);}
console.log(`Verified ${selected.size} files (${bytes} bytes), ${catalog.papers.length} papers, ${catalog.lessons.length} written lessons and all static resource references.`);
