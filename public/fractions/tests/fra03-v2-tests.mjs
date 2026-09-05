import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const testsRoot = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(testsRoot, "..");
const canonicalPath = join(appRoot, "js", "fra03-canonical.js");
const visualsPath = join(appRoot, "js", "fra03-visuals.js");
const stylesPath = join(appRoot, "styles.css");
const assetsPath = join(appRoot, "js", "fra03-narration-assets.js");
const manifestPath = join(appRoot, "fra03-narration-manifest.json");

const context = vm.createContext({ window: {} });
new vm.Script(await readFile(canonicalPath, "utf8"), { filename: canonicalPath }).runInContext(context);
new vm.Script(await readFile(visualsPath, "utf8"), { filename: visualsPath }).runInContext(context);
new vm.Script(await readFile(assetsPath, "utf8"), { filename: assetsPath }).runInContext(context);

const spec = {
  identity: { id: "FRA-03" },
  experience_contract: { global_ui_copy: {} },
  voice_and_script: {},
  visual_language: {},
  engine_capability_requirements: {},
  lesson: {}
};
context.window.RevilyFra03Canonical.apply(spec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-03-${id}`);
const scene = (id) => spec.lesson.teaching_steps.find((item) => item.id === id);

assert.equal(spec.canonical_lesson.version, "FRA03-2.0");
assert.match(spec.canonical_lesson.source_of_truth, /Revily_FRA03_Storyboard_v2\.pdf/);
assert.equal(spec.diagnostic.enabled, false);
assert.deepEqual([...spec.diagnostic.question_refs], []);
assert.deepEqual([...spec.lesson.practice.question_order], []);
assert.deepEqual([...context.window.RevilyFra03Canonical.validateCanonical(spec)], []);
assert.equal(spec.voice_and_script.narration_playback.opening_delay_ms, 0);
assert.equal(spec.voice_and_script.narration_playback.beat_gap_ms, 60);
assert.equal(spec.voice_and_script.narration_playback.advance_delay_ms, 280);
assert.equal(spec.voice_and_script.narration_playback.locked_working_mode, "reaction_only");
assert.equal(spec.experience_contract.sequential_locked_working, true);
assert.equal(spec.experience_contract.deduplicate_exit_repairs, true);
assert.equal(spec.experience_contract.completion_header_controls, true);

for (const step of spec.lesson.teaching_steps) {
  const beats = step.narration.beats || [];
  assert.equal(step.narration.script, beats.map((beat) => beat.text).join(" "), `${step.id} transcript is not derived from active beats`);
  const beatIds = new Set(beats.map((beat) => beat.id));
  assert.equal(beatIds.size, beats.length, `${step.id} beat IDs are not unique`);
  for (const event of step.narration.sync_cues || []) {
    assert.ok(event.id && event.beatId, `${step.id} has an unbound visual event`);
    const beat = beats.find((item) => item.id === event.beatId);
    assert.ok(beat, `${event.id} points to a missing narration beat`);
    assert.ok(beat.text.toLowerCase().includes(event.cue.toLowerCase()), `${event.id} cue is not active Ryan text`);
  }
}

assert.equal(scene("HOOK").narration.beats.length, 4);
assert.match(scene("HOOK").narration.script, /^You’ve finished three of five challenges/);
assert.deepEqual([...scene("HOOK").scene.model.variants].map((item) => item.context), ["area_model", "set_model", "number_line"]);
assert.deepEqual([...scene("HOOK").narration.sync_cues].map((event) => event.action), [
  "fill_progress", "show_fraction", "prepare_transform", "show_progress", "show_badges", "show_route", "show_comparison"
]);
assert.match(scene("HOOK").narration.sync_cues.at(-1).accessibleLabel, /Three views of the same game progress/);
assert.equal(scene("T1").scene.model.totalParts, 5);
assert.equal(scene("T1").scene.model.selectedParts, 3);
assert.equal(scene("T2").scene.model.context, "set_model");
assert.equal(scene("T2").scene.model.wholeBoundary, true);
assert.equal(scene("T3").scene.model.equalIntervals, 5);
assert.equal(scene("T3").scene.model.markedInterval, 3);
assert.ok(scene("T1").narration.sync_cues.every((event) => event.accessibleLabel));
assert.ok(scene("T2").narration.sync_cues.every((event) => event.accessibleLabel));
assert.ok(scene("T3").narration.sync_cues.every((event) => event.accessibleLabel));
assert.deepEqual([...scene("T4").scene.model.variants].map((item) => [item.totalParts, item.selectedParts]), [[7, 4], [7, 4], [7, 4]]);

assert.equal(question("G1").prompt, "Which progress panel correctly shows 2/5?");
assert.notEqual(question("HOOK-CHOICE").scripts.engagement_correct_feedback, question("HOOK-CHOICE").scripts.engagement_incorrect_feedback);
assert.deepEqual([...question("G1").response.optionModels].map((item) => [item.totalParts, item.selectedParts]), [[5, 2], [5, 2], [6, 2]]);
assert.equal(question("G1").response.optionModels[1].unequalParts, true);
assert.equal(question("G2").answer.value, "4/6");
assert.equal(question("G2").model.equalIntervals, 6);
assert.equal(question("G2").model.markedInterval, 4);
assert.equal(question("F1").answer.value, "5/9");
assert.equal(question("F1").model.context, "set_model");
assert.equal(question("F2").model.fraction.numerator, 4);
assert.equal(question("F2").model.fraction.denominator, 7);
assert.deepEqual([...question("F2").response.optionModels].map((item) => [item.totalParts, item.selectedParts]), [[7, 4], [7, 3], [6, 4]]);
assert.deepEqual([...question("I1").answer.value], ["A", "B", "C"]);
assert.deepEqual([...question("I1").response.optionModels].slice(0, 3).map((item) => [item.totalParts, item.selectedParts]), [[7, 3], [7, 3], [7, 3]]);
assert.equal(question("I2").response.totalTokens, 8);
assert.equal(question("I2").answer.value, "5");
assert.equal(question("M1").answer.value, "7/10");
assert.equal(question("M2").answer.value, "5/12");
assert.equal(question("M3").answer.value, "5/8");
assert.equal(question("M4").answer.value, "B. Area and set are 3/6; the number line is 3/5.");

for (const id of ["M1", "M2", "M3", "M4"]) {
  assert.equal(question(id).policy.hintPolicy, "none");
  assert.equal(question(id).policy.solutionPolicy, "after_locked_submit");
  assert.equal(question(id).scripts.worked_steps.length, 3);
}

assert.equal(question("R-WHOLE").model.totalParts, 5);
assert.equal(question("R-WHOLE").model.selectedParts, 2);
assert.equal(question("C-WHOLE-1").model.totalParts, 8);
assert.equal(question("C-WHOLE-1").model.selectedParts, 3);

const visuals = context.window.RevilyFra03Visuals;
assert.doesNotMatch(visuals.numberLineMarkup(question("G2").model), /equal intervals ·/);
assert.match(visuals.numberLineMarkup(scene("T3").scene.model), /5 equal intervals · 6 boundary marks/);
const areaFacts = visuals.accessibleDescription(question("M1").model);
assert.doesNotMatch(areaFacts, /\b(?:7|10)\b|7\/10/);
assert.match(areaFacts, /Region states in reading order: selected/);
const setFacts = visuals.accessibleDescription(question("M2").model);
assert.doesNotMatch(setFacts, /\b(?:5|12)\b|5\/12/);
assert.match(setFacts, /Object states in reading order: selected/);
const lineFacts = visuals.accessibleDescription(question("M3").model);
assert.doesNotMatch(lineFacts, /\b(?:5|8|9)\b|5\/8/);
assert.match(lineFacts, /Interval states from zero: travelled/);
assert.match(visuals.accessibleDescription(scene("T1").scene.model), /not been revealed yet/);
assert.match(visuals.accessibleDescription(scene("T2").scene.model), /No badge is marked complete yet/);
assert.match(visuals.accessibleDescription(scene("T3").scene.model), /marker begins at zero/);

const styles = await readFile(stylesPath, "utf8");
assert.match(styles, /\.fra03-game-transform \.layer-progress > strong/);
assert.match(styles, /\.fra03-game-transform \.layer-progress \.fra03-area-part\.is-selected i/);
assert.match(styles, /\.fra03-teaching-model \.is-teaching-progress \.fra03-area-part \+ \.fra03-area-part/);
assert.match(styles, /\.fra03-teaching-model \.fra03-number-line\.is-route \.fra03-mark \{ left: 0; \}/);
assert.match(styles, /\.fra03-teaching-model \.fra03-number-line\.is-route \.fra03-route-you \{ left: 0; \}/);
assert.match(styles, /\.teaching-surface:has\(\.fra03-context-visual\) \.canvas-caption:empty/);

assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.otherwise, "F1");
assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question["FRA-03-I1"], "FRA-03-C-MATCH");
assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question["FRA-03-I2"], "FRA-03-C-BUILD");
assert.deepEqual(Object.keys(spec.lesson.adaptive_pathway.repair_by_error_family).sort(), ["equal_area", "interval_count", "same_fraction", "whole_not_defined"]);
assert.equal(spec.lesson.exit.mastery_policy.secureMinimum, 3);
assert.equal(spec.lesson.exit.mastery_policy.twoCorrectRequiredFreshSuccesses, 2);
assert.equal(spec.lesson.exit.mastery_policy.zeroOrOneCorrectRequiredFreshSuccesses, 4);

const learnerText = [
  ...spec.lesson.teaching_steps.flatMap((step) => [step.scene.display_title, step.narration.script]),
  ...Object.values(spec.lesson.transfer_steps).map((step) => step.pre_question_script),
  ...spec.question_bank.flatMap((item) => [item.prompt, ...Object.values(item.scripts || {}), ...Object.values(item.mathematical_support || {})]),
  spec.completion.secure.ryan_script,
  spec.completion.needs_work.ryan_script
].flat().filter(Boolean).join(" ");
assert.doesNotMatch(learnerText, /diagnostic|retrieval|error family|assessment intent|storyboard|implementation|developer/i);
assert.doesNotMatch(learnerText, /simplif|equivalent fraction|mixed number|operation/i);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
assert.equal(manifest.voice, "en-GB-RyanNeural");
const tracks = new Map(manifest.tracks.map((track) => [track.text, track]));
const registeredTracks = context.window.RevilyNarrationAssets.tracks;
for (const track of manifest.tracks) {
  assert.ok(track.words?.length, `${track.text} has no word alignment`);
  assert.equal(track.words.map((word) => word.text).join(" ").replace(/\s+/g, " ").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), track.text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), `${track.text} alignment does not match Ryan text`);
  assert.equal(registeredTracks[track.text].src, `/fractions/audio/${track.file}`);
  const audioPath = join(appRoot, "audio", track.file);
  assert.ok(existsSync(audioPath), `${track.file} is missing`);
  assert.ok((await stat(audioPath)).size > 128, `${track.file} is empty`);
}

const requiredSpeech = new Set();
const addSpeech = (value) => {
  if (Array.isArray(value)) return value.forEach(addSpeech);
  String(value || "").match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()).filter(Boolean).forEach((line) => requiredSpeech.add(line));
};
spec.lesson.teaching_steps.forEach((step) => addSpeech(step.narration.script));
Object.values(spec.lesson.transfer_steps).forEach((step) => addSpeech(step.pre_question_script));
addSpeech(spec.lesson.exit.intro_script);
Object.values(spec.lesson.adaptive_pathway.feedback_by_error_family).forEach(addSpeech);
addSpeech(spec.completion.secure.ryan_script);
addSpeech(spec.completion.needs_work.ryan_script);
for (const item of spec.question_bank) {
  [item.scripts?.before_submit, item.scripts?.on_correct_math, item.scripts?.on_incorrect_attempt_1, item.scripts?.on_incorrect_attempt_2,
    item.scripts?.on_correct_reaction, item.scripts?.on_incorrect_reaction, item.scripts?.engagement_response, item.scripts?.worked_explanation,
    item.scripts?.reteach, ...Object.values(item.scripts?.response_feedback || {}), item.mathematical_support?.hint_1, item.mathematical_support?.hint_2].forEach(addSpeech);
}
for (const line of requiredSpeech) assert.ok(tracks.has(line), `Missing Ryan track: ${line}`);

console.log(`FRA-03 v2 tests passed: ${spec.question_bank.length} questions, ${manifest.tracks.length} aligned Ryan beats.`);
