import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url)),root=path.join(repo,'physics-release');
const manifestPath=path.join(repo,'physics-release-manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath));
manifest.updatedAt=new Date().toISOString();
manifest.subjects=['IB Physics','IB Mathematics','IGCSE Mathematics A Higher'];
manifest.maths={ib:{questions:6720,reviewed:30,provisional:6690,papers:693},igcse:{questions:3041,parts:4655,papers:142},notes:'coming-soon'};
manifest.files={};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const f=path.join(dir,entry.name);if(entry.isDirectory())walk(f);else{const bytes=fs.readFileSync(f);manifest.files[path.relative(root,f).split(path.sep).join('/')]={bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};}}}
walk(root);fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('Release manifest: '+Object.keys(manifest.files).length+' files');
