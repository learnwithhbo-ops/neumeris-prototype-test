import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {collect} from '../scripts/build-refined-audio.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'fractions/refined-narration-manifest.json'),'utf8'));
assert.equal(manifest.voice,'en-GB-RyanNeural');assert.equal(manifest.owner_approval_date,'2026-09-03');
const context=vm.createContext({window:{RevilyNarrationAssets:{tracks:{}}}});
vm.runInContext(fs.readFileSync(path.join(root,'fractions/js/refined-narration-assets.js'),'utf8'),context);
const assets=context.window.RevilyNarrationAssets.tracks;
for(const track of manifest.tracks) {
  const audio=fs.readFileSync(path.join(root,'fractions/audio',track.file));
  assert.ok(audio.length>128);assert.ok(audio.toString('ascii',0,3)==='ID3'||audio[0]===255&&(audio[1]&224)===224);
  assert.ok(track.words.length>0);assert.ok(track.words[0].atMs<500,'no unnecessary opening silence');
  for(let i=0;i<track.words.length;i++){const w=track.words[i];assert.ok(w.text&&w.durationMs>=0);assert.ok(w.atMs>=(track.words[i-1]?.atMs||0));}
  assert.ok(track.durationMs>=track.words.at(-1).atMs);
  assert.deepEqual(audio,fs.readFileSync(path.join(root,'revily-site/public/fractions/audio',track.file)));
  assert.equal(assets[track.text].words.length,track.words.length);
}
for(const id of manifest.target_lessons) {
  const curriculumFolder=id.startsWith('AF-')?'CUR-N01_Add_Subtract_Fractions_v1_0':'CUR-N02_Multiply_Divide_Fractions_v1_0';
  const spec=JSON.parse(fs.readFileSync(path.join(root,curriculumFolder,'skills',`${id}_COMPLETE_v1.2.yaml`),'utf8'));
  assert.equal(spec.voice_and_script.narration_playback.mode,'authored_audio_then_browser_speech');
  assert.equal(spec.voice_and_script.narration_playback.timing_source,'provider_word_boundaries');
  for(const line of collect(spec).keys())assert.ok(assets[line],`${id}: missing exact Ryan line ${line}`);
}
assert.equal(fs.readFileSync(path.join(root,'fractions/js/refined-narration-assets.js'),'utf8'),fs.readFileSync(path.join(root,'revily-site/public/fractions/js/refined-narration-assets.js'),'utf8'));
console.log(`${manifest.tracks.length} owner-approved Ryan MP3s, exact runtime line coverage, provider word timings, prompt starts and mirrors passed.`);
