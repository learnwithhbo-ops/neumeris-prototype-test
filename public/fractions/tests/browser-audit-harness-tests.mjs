import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const check=spawnSync(process.execPath,[path.join(root,'scripts/sync-browser-audit-harness.mjs'),'--check'],{encoding:'utf8'});
assert.equal(check.status,0,check.stderr||check.stdout);
console.log('Browser audit harness: all application runtime dependencies and styles match; 71 lesson goldens match their independent source-contract tests; hosted mirrors match.');
