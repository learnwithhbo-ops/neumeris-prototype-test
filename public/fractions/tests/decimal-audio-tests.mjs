import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { TARGET_IDS, collectLines, loadSpecs } from "../scripts/build-decimal-audio.mjs";

const testsRoot = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(testsRoot, "..");
const manifestPath = path.join(appRoot, "decimal-narration-manifest.json");
const mappingPath = path.join(appRoot, "js", "decimal-narration-assets.js");
const indexPath = path.join(appRoot, "index.html");
const loaderPath = path.join(appRoot, "js", "skill-loader.js");
const enginePath = path.join(appRoot, "js", "lesson-engine.js");
const audioRoot = path.join(appRoot, "audio");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
assert.equal(manifest.voice, "en-GB-RyanNeural");
assert.equal(manifest.voice_name, "Microsoft Ryan Online (Natural) - English (United Kingdom)");
assert.deepEqual(manifest.target_lessons, TARGET_IDS);
assert.equal(new Set(manifest.tracks.map((track) => track.text)).size, manifest.tracks.length, "Ryan text must be unique");
assert.equal(new Set(manifest.tracks.map((track) => track.file)).size, manifest.tracks.length, "Ryan filenames must be unique");

const liveLines = collectLines(loadSpecs());
const tracksByText = new Map(manifest.tracks.map((track) => [track.text, track]));
assert.equal(manifest.tracks.length, liveLines.length, "manifest has stale or missing Decimal Ryan lines");
for (const line of liveLines) {
  const track = tracksByText.get(line.text);
  assert.ok(track, `${line.lessons.join(", ")} is missing approved Ryan audio: ${line.text}`);
  assert.deepEqual(track.lessons, line.lessons, `${line.text} lesson coverage drifted`);
}

for (const track of manifest.tracks) {
  assert.ok(Array.isArray(track.words) && track.words.length > 0, `${track.file} has no provider word timing`);
  assert.ok(Number.isFinite(track.durationMs) && track.durationMs > 0, `${track.file} has no duration`);
  track.words.forEach((word, index) => {
    assert.ok(word.text, `${track.file} has an empty word boundary`);
    assert.ok(Number.isFinite(word.atMs) && word.atMs >= 0, `${track.file} has an invalid word time`);
    assert.ok(Number.isFinite(word.durationMs) && word.durationMs >= 0, `${track.file} has an invalid word duration`);
    if (index) assert.ok(word.atMs >= track.words[index - 1].atMs, `${track.file} word timing is not monotonic`);
  });

  const audioPath = path.join(audioRoot, track.file);
  const descriptor = fs.openSync(audioPath, "r");
  const header = Buffer.alloc(3);
  try {
    assert.ok(fs.fstatSync(descriptor).size > 128, `${track.file} is empty`);
    fs.readSync(descriptor, header, 0, header.length, 0);
  } finally {
    fs.closeSync(descriptor);
  }
  assert.ok(header.toString("ascii", 0, 3) === "ID3" || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0), `${track.file} is not an MP3`);
}

const assetContext = vm.createContext({ window: {} });
new vm.Script(fs.readFileSync(mappingPath, "utf8"), { filename: mappingPath }).runInContext(assetContext);
const assets = assetContext.window.RevilyNarrationAssets;
assert.equal(assets.voice, "en-GB-RyanNeural");
for (const track of manifest.tracks) {
  const asset = assets.tracks[track.text];
  assert.equal(asset?.src, `/fractions/audio/${track.file}`, `${track.text} asset path drifted`);
  assert.equal(asset?.words?.length, track.words.length, `${track.text} asset timing drifted`);
}

const loaderContext = vm.createContext({ window: { RevilyTopics: { find: () => null } } });
new vm.Script(fs.readFileSync(loaderPath, "utf8"), { filename: loaderPath }).runInContext(loaderContext);
const applyPolicy = loaderContext.window.RevilySkillLoader.applyDecimalAudioPolicy;
for (const id of TARGET_IDS) {
  const spec = { identity: { id }, voice_and_script: { narration_playback: { mode: "browser_speech_ryan" } } };
  applyPolicy(spec, id);
  assert.equal(spec.voice_and_script.narration_playback.mode, "authored_audio_then_browser_speech", `${id} audio policy was not applied`);
  assert.equal(spec.voice_and_script.narration_playback.require_ryan_voice, true, `${id} voice lock was not applied`);
  assert.equal(spec.voice_and_script.narration_playback.timing_source, "provider_word_boundaries", `${id} timing source was not applied`);
}
for (const id of ["FRA-06", "DEC-00", "DEC-20"]) {
  const spec = { identity: { id }, voice_and_script: { narration_playback: { mode: "unchanged" } } };
  applyPolicy(spec, id);
  assert.equal(spec.voice_and_script.narration_playback.mode, "unchanged", `${id} was changed outside Decimal scope`);
}

const index = fs.readFileSync(indexPath, "utf8");
const packIndex = index.indexOf("js/decimal-narration-assets.js");
assert.ok(packIndex > index.indexOf("js/fra06-28-narration-assets.js"), "Decimal assets must merge after Fraction narration assets");
assert.ok(packIndex < index.indexOf("js/lesson-engine.js"), "Decimal assets must load before the lesson engine");

const engine = fs.readFileSync(enginePath, "utf8");
assert.match(engine, /\/\^DEC-\/\.test\(this\.spec\.identity\?\.id \|\| ""\)/, "Decimal incorrect feedback must resolve from authored lesson copy");
assert.match(engine, /this\.narrationPlayback\.mode !== "authored_audio_then_browser_speech" \|\| !this\.state\.soundOn/, "packaged narration must be eligible for preloading");

console.log(`Decimal Ryan audio tests passed (${manifest.tracks.length} aligned tracks across ${TARGET_IDS.length} lessons).`);
