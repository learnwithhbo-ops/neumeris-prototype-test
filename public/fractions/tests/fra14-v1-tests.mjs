import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const fractionsDir = path.resolve(testsDir, "..");
const workspaceRoot = path.resolve(fractionsDir, "..");
const typescriptModule = await import("typescript");
const ts = typescriptModule.default || typescriptModule;

const canonicalSource = fs.readFileSync(path.join(workspaceRoot, "FRA14_CANONICAL_SPEC.ts"), "utf8");
const compiled = ts.transpileModule(canonicalSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
  fileName: "FRA14_CANONICAL_SPEC.ts",
  reportDiagnostics: true
});
const compileErrors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.equal(compileErrors.length, 0, "FRA14 canonical TypeScript must compile without errors");
const sourceModule = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: sourceModule, exports: sourceModule.exports }, { filename: "FRA14_CANONICAL_SPEC.ts" });
assert.equal(sourceModule.exports.validateFRA14CanonicalSpec().length, 0, "validateFRA14CanonicalSpec() must pass in the repository");

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const localStorage = new MemoryStorage();
const windowObject = {
  localStorage,
  location: { search: "" },
  crypto: { randomUUID: () => "fra14-test-attempt" },
  RevilyTopics: { all: [{ id: "fractions", title: "Fractions", storageNamespace: "fractions", skillIdPattern: "^FRA-" }] },
  setTimeout,
  clearTimeout
};
windowObject.window = windowObject;
const context = vm.createContext({
  window: windowObject,
  localStorage,
  document: { addEventListener() {}, removeEventListener() {}, hidden: false, body: { contains: () => false } },
  URLSearchParams,
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
  console,
  setTimeout,
  clearTimeout,
  structuredClone
});

function load(relativePath) {
  const filePath = path.join(fractionsDir, relativePath);
  new vm.Script(fs.readFileSync(filePath, "utf8"), { filename: filePath }).runInContext(context);
}

load("js/fra14-approved-spec.js");
load("js/fra14-canonical.js");
load("js/fra14-visuals.js");
load("js/validators.js");
load("js/lesson-model.js");

const approved = windowObject.RevilyFra14Approved;
const runtime = windowObject.FRA14_RUNTIME_COPY;
const canonical = windowObject.RevilyFra14Canonical;
assert.equal(Object.keys(runtime).length, 41, "all approved FRA14 runtime utterances must be present");
assert.equal(canonical.validateRuntimeContract().length, 0, "runtime/caption/cue validation must pass");
assert.deepEqual(Object.keys(runtime), Object.keys(sourceModule.exports.FRA14_RUNTIME_COPY), "generated and TypeScript runtime IDs must match");
for (const [id, entry] of Object.entries(runtime)) {
  assert.equal(entry.text, sourceModule.exports.FRA14_RUNTIME_COPY[id].text, `${id} text must match the authoritative TypeScript`);
  assert.equal(entry.captionSource, "same_as_audio", `${id} caption must resolve from the same utterance`);
}

const baseSpec = {
  schema_version: "1.2",
  identity: { id: "FRA-14", title: "Find the Whole from a Fractional Part" },
  dependencies: { required_skill_refs: ["FRA-13"] },
  diagnostic: {}, retrieval_practice: {}, lesson: {}, completion: {},
  voice_and_script: {}, visual_language: {}, engine_capability_requirements: {}, experience_contract: { global_ui_copy: {} }
};
const spec = canonical.apply(baseSpec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-14-${id}`);
const styles = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{\s*\.fra14-section,[\s\S]*?animation: none !important;/, "FRA14 must provide a reduced-motion equivalent");
assert.equal(spec.canonical_lesson.version, "FRA14-HANDOFF-V1");
assert.equal(spec.canonical_lesson.engine_profile, "fra14");
assert.deepEqual(Array.from(spec.lesson.teaching_steps, (step) => step.id), ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF"]);
assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
assert.deepEqual([...spec.lesson.exit.primary_question_refs], ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-14-${id}`));
assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1", "both routes must retain F2");
assert.equal(spec.diagnostic.question_refs.length, 0, "FRA14 must not add a Diagnostic layer");
assert.equal(spec.retrieval_practice.enabled, false, "FRA14 must not add Retrieval");

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten) : typeof value === "string" && value ? [value] : [];
for (const scene of spec.lesson.teaching_steps) {
  for (const line of flatten(scene.narration.script)) assert.ok(runtimeTexts.has(line), `${scene.id} narration escaped FRA14_RUNTIME_COPY`);
  for (const cue of scene.narration.sync_cues || []) {
    assert.ok(runtime[cue.utteranceId], `${cue.id} has no utterance`);
    assert.ok(runtime[cue.utteranceId].text.toLowerCase().includes(cue.cue.toLowerCase()), `${cue.id} anchor is absent from its utterance`);
  }
}
for (const item of spec.question_bank) {
  const spokenFields = [item.scripts?.before_submit, item.scripts?.on_correct_reaction, item.scripts?.on_incorrect_reaction, item.scripts?.reteach];
  for (const line of spokenFields.flatMap(flatten)) assert.ok(runtimeTexts.has(line), `${item.id} contains non-authoritative Ryan speech: ${line}`);
  assert.equal(Object.prototype.hasOwnProperty.call(item, "captionText"), false, `${item.id} must not define captionText`);
}
const usedCueIds = new Set([
  ...spec.lesson.teaching_steps.flatMap((scene) => scene.narration.sync_cues || []),
  ...spec.question_bank.flatMap((item) => item.visual?.syncCues || [])
].map((cue) => cue.id));
for (const cue of approved.speechLedCues) assert.ok(usedCueIds.has(cue.id), `${cue.id} must not be orphaned`);

function correctResponse(raw, converted) {
  if (raw.response.kind === "numeric") return String(raw.answer);
  if (raw.response.kind === "two_step_numeric") return { onePart: String(raw.answer.onePart), whole: String(raw.answer.whole) };
  if (raw.response.kind === "plan_and_numeric") return { choice: raw.response.planOptions.find((option) => option.id === raw.answer.planId).label, whole: String(raw.answer.whole) };
  if (raw.response.kind === "model_and_numeric") return { choice: converted.response.options.find((label) => converted.response.optionIds[label] === raw.answer.modelId), whole: String(raw.answer.whole) };
  return raw.response.options.find((option) => option.id === raw.answer).label;
}

function wrongResponse(raw, converted) {
  if (raw.response.kind === "numeric") return String(Number(raw.answer) + 1);
  if (raw.response.kind === "two_step_numeric") return { onePart: String(raw.answer.onePart + 1), whole: String(raw.answer.whole) };
  if (raw.response.kind === "plan_and_numeric") return { choice: raw.response.planOptions.find((option) => option.id !== raw.answer.planId).label, whole: String(raw.answer.whole) };
  if (raw.response.kind === "model_and_numeric") return { choice: `Model ${raw.response.modelOptions.find((option) => option.id !== raw.answer.modelId).id}`, whole: String(raw.answer.whole) };
  return raw.response.options.find((option) => option.id !== raw.answer).label;
}

for (const raw of [...approved.questions, ...approved.confirmations, ...approved.replacementFinals]) {
  const converted = question(raw.id);
  const right = canonical.evaluateResponse(converted, correctResponse(raw, converted));
  assert.equal(right.correct, true, `${raw.id} correct response was rejected`);
  assert.deepEqual([...right.utteranceIds], [...raw.feedback.correctUtteranceIds], `${raw.id} correct outcome branch changed`);
  const wrong = canonical.evaluateResponse(converted, wrongResponse(raw, converted));
  assert.equal(wrong.correct, false, `${raw.id} wrong response was accepted`);
  const expectedWrong = raw.feedback.errorSpecificUtteranceIds?.[wrong.errorFamily] || raw.feedback.incorrectDefaultUtteranceIds;
  assert.deepEqual([...wrong.utteranceIds], [...expectedWrong], `${raw.id} must play exactly one matching incorrect branch`);
  if (raw.feedback.correctUtteranceIds.length) {
    assert.ok(!wrong.utteranceIds.some((id) => raw.feedback.correctUtteranceIds.includes(id)), `${raw.id} wrong response must never play the correct line`);
  }
  assert.equal(canonical.validateQuestionModel(converted).length, 0, `${raw.id} math/bar model must validate`);
}

const hook = question("HOOK");
const hookVisible = Object.values(hook.scripts.engagement_visible_by_id);
assert.equal(new Set(hookVisible).size, 3, "hook choices need distinct visible feedback");
assert.deepEqual([...hook.runtimeOutcome.commonRevealUtteranceIds], ["HOOK.REVEAL.1", "HOOK.REVEAL.2"]);
assert.equal(hook.policy.scored, false);
assert.equal(hook.policy.engagementOnly, true);

for (const id of ["F1", "F2", "I1", "I2"]) {
  assert.equal(question(id).policy.hintPolicy, "optional", `${id} hint must start optional/collapsed`);
  assert.equal(question(id).policy.requiresFreshNoHintConfirmationIfHintUsed, true, `${id} hint use must require fresh evidence`);
}
assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question["FRA-14-I1"], "FRA-14-C-CONTEXT");
assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question["FRA-14-I2"], "FRA-14-C-MODEL");
for (const id of ["M1", "M2", "M3", "M4", "M5", "RM1", "RM2", "RM3", "RM4", "RM5"]) {
  assert.equal(question(id).policy.hintPolicy, "none", `${id} must not have a hint`);
  assert.equal(question(id).policy.answerLocksOnSubmit, true, `${id} must lock on submit`);
  assert.equal(question(id).policy.solutionPolicy, "after_locked_submit", `${id} working must follow answer lock`);
}
assert.match(question("M4").scripts.worked_explanation, /not 7\.\n2\. One part:/, "M4 numbered working must not split on the mathematical value 7");
for (const [family, repair] of Object.entries({ PART_AS_WHOLE: "R-PART", DIVIDE_BY_DENOM_OR_ROLE_SWAP: "R-ROLES", MULTIPLY_NUMERATOR: "R-SCALE", STOP_AT_ONE_PART: "R-ONEPART" })) {
  assert.equal(spec.lesson.adaptive_pathway.repair_by_error_family[family], `FRA-14-${repair}`);
  assert.ok(spec.lesson.adaptive_pathway.fresh_checks_by_error_family[family]?.length, `${family} must have a fresh confirmation`);
}

const secureRecords = [
  { family: "unit_fraction_final", correct: true, firstAttemptCorrect: true },
  { family: "visual_non_unit_final", correct: true, firstAttemptCorrect: true },
  { family: "money_context_final", correct: true, firstAttemptCorrect: true },
  { family: "error_analysis_final", correct: true, firstAttemptCorrect: true },
  { family: "implied_fraction_structure_final", correct: false, firstAttemptCorrect: false, errorFamily: "STOP_AT_ONE_PART" }
];
assert.equal(canonical.evaluateFinalEvidence(secureRecords).masterySatisfied, true, "4/5 with context/reasoning must finish");
assert.equal(canonical.evaluateFinalEvidence(secureRecords.map((record, index) => index >= 3 ? { ...record, correct: false, firstAttemptCorrect: false, errorFamily: "STOP_AT_ONE_PART" } : record)).masterySatisfied, false, "a repeated central blocker must prevent finish");
assert.deepEqual([...canonical.selectReplacementIds(["FRA-14-M2", "FRA-14-M5"], false)], ["FRA-14-RM2", "FRA-14-RM5"]);
assert.deepEqual([...canonical.selectReplacementIds([], true)], ["RM1", "RM2", "RM3", "RM4", "RM5"].map((id) => `FRA-14-${id}`));

const visuals = windowObject.RevilyFra14Visuals;
const m2Initial = visuals.renderMarkup(question("M2").visual, { question: question("M2"), feedback: "initial" });
assert.ok(!m2Initial.includes("fra14-working"), "final working must not render before lock");
assert.ok(!m2Initial.includes("7 × 9 = 63"), "final whole must not leak before lock");
const m2Worked = visuals.renderMarkup(question("M2").visual, { question: question("M2"), feedback: "worked" });
assert.ok(m2Worked.includes("fra14-working"), "final working must render after lock");
assert.ok(m2Worked.includes("7 × 9 = 63"), "post-lock visual must rebuild the exact whole");
const hookMarkup = visuals.renderMarkup({ model: spec.lesson.teaching_steps[0].scene.model }, { feedback: "initial" });
assert.equal((hookMarkup.match(/class="fra14-section(?: |")/g) || []).length, 4, "hook must use exactly four equal route sections");
const t4Markup = visuals.renderMarkup({ model: spec.lesson.teaching_steps.find((step) => step.id === "T4").scene.model }, { feedback: "initial" });
assert.equal((t4Markup.match(/class="fra14-section(?: |")/g) || []).length, 5, "unit-fraction example must use exactly five equal cable sections");

const model = windowObject.RevilyLessonModel.buildLessonModel(spec);
assert.equal(model.firstId, "HOOK");
assert.equal(model.getNode("G2").nextId, "F1");
assert.equal(model.getNode("F2").nextId, "I1");
assert.equal(model.exitIds.length, 5);

windowObject.RevilyVisuals = { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render() {} };
windowObject.RevilyNarrationSync = { NarrationSync: class NarrationSync { stop() {} } };
load("js/lesson-engine.js");
const LessonEngine = windowObject.RevilyLessonEngine.LessonEngine;
const storageKey = "revily.fractions.FRA-14.current.v1";
localStorage.setItem(storageKey, JSON.stringify({ version: 1, contentVersion: "legacy-fra14-yaml", topicId: "fractions", skillId: "FRA-14", attemptId: "old-attempt", status: "SECURE", cursor: "T08", drafts: { old: "stale" }, submissions: { old: [{ response: "stale" }] }, exit: { result: "SECURE" }, soundOn: false, developerOpen: true }));
const migrated = new LessonEngine({}, spec, {}, { topic: { id: "fractions", title: "Fractions", storageNamespace: "fractions" } });
assert.equal(migrated.state.cursor, "HOOK");
assert.equal(migrated.state.soundOn, false);
assert.equal(migrated.state.developerOpen, true);
assert.deepEqual({ ...migrated.state.drafts }, {});
assert.equal(migrated.state.contentMigration.to, "FRA14-HANDOFF-V1");
const history = JSON.parse(localStorage.getItem("revily.fractions.FRA-14.history.v1"));
assert.equal(history.at(-1).completionResult, "SECURE", "old completion status must be archived during migration");

const routeHarness = Object.create(LessonEngine.prototype);
routeHarness.spec = spec;
routeHarness.model = model;
routeHarness.emit = () => {};
routeHarness.state = migrated.freshState();
routeHarness.state.evidence.firstAttemptCorrect["FRA-14-G1"] = true;
routeHarness.state.evidence.firstAttemptCorrect["FRA-14-G2"] = true;
routeHarness.state.evidence.componentFirstAttemptCorrect["FRA-14-G1"] = { onePart: true, whole: true };
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F2", "strong route must skip F1 and retain F2");
routeHarness.state.evidence.componentFirstAttemptCorrect["FRA-14-G1"].whole = false;
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F1", "standard route must retain F1");
routeHarness.state.evidence.pendingNoHintConfirmations = ["FRA-14-C-MODEL"];
assert.equal(routeHarness.adaptiveNextId(model.getNode("I2")), "FRESH:FRA-14-C-MODEL", "I2 hint evidence must reach its fresh no-hint confirmation");

function finalHarness(correctIds, candidates) {
  const harness = Object.create(LessonEngine.prototype);
  harness.spec = spec;
  harness.model = model;
  harness.emit = () => {};
  harness.state = migrated.freshState();
  model.exitIds.forEach((id) => {
    const correct = correctIds.has(id);
    harness.state.exit.responses[id] = { response: "test", correct };
    harness.state.evidence.firstAttemptCorrect[id] = correct;
    if (!correct && candidates?.[id]) harness.state.evidence.candidateErrorFamily[id] = candidates[id];
  });
  return harness;
}

const fourHarness = finalHarness(new Set(["FRA-14-M1", "FRA-14-M2", "FRA-14-M3", "FRA-14-M4"]), { "FRA-14-M5": "STOP_AT_ONE_PART" });
fourHarness.routeFra14FinalEvidence(4, ["FRA-14-M5"]);
assert.equal(fourHarness.state.exit.result, "SECURE", "secure 4/5 must finish");

const threeHarness = finalHarness(new Set(["FRA-14-M1", "FRA-14-M2", "FRA-14-M3"]), { "FRA-14-M4": "STOP_AT_ONE_PART", "FRA-14-M5": "STOP_AT_ONE_PART" });
threeHarness.routeFra14FinalEvidence(3, ["FRA-14-M4", "FRA-14-M5"]);
assert.equal(threeHarness.state.exit.remediation.route, "score_three_repair_and_replace_failed_slots");
assert.deepEqual([...threeHarness.state.exit.remediation.recoveryIds], ["FRA-14-RM4", "FRA-14-RM5"]);
assert.equal(threeHarness.state.cursor, "RECOVERY:FRA-14-R-ONEPART");
threeHarness.persist = () => {};
threeHarness.render = () => {};
const pendingThreeRepair = threeHarness.state.pendingRecovery;
assert.equal(threeHarness.beginFra14FinalRepairCheck(pendingThreeRepair), true, "final structural repair must require its unseen RC confirmation");
assert.equal(threeHarness.state.cursor, "FRESH:FRA-14-RC-ONEPART");
assert.equal(threeHarness.state.freshContext.fra14FinalRepairCheck, true);
threeHarness.state.freshContext.correct = true;
threeHarness.advanceFresh({ questionId: "FRA-14-RC-ONEPART" });
assert.equal(threeHarness.state.cursor, "FRESH:FRA-14-RM4", "passed RC confirmation must begin failed-slot replacement finals");
threeHarness.state.exit.responses["FRA-14-RM4"] = { response: "40", correct: true };
threeHarness.state.evidence.firstAttemptCorrect["FRA-14-RM4"] = true;
threeHarness.state.freshContext.correct = true;
threeHarness.advanceFresh({ questionId: "FRA-14-RM4" });
assert.equal(threeHarness.state.cursor, "FRESH:FRA-14-RM5", "each failed evidence slot must receive its own replacement final");

const twoHarness = finalHarness(new Set(["FRA-14-M1", "FRA-14-M3"]), { "FRA-14-M2": "PART_AS_WHOLE", "FRA-14-M4": "PART_AS_WHOLE", "FRA-14-M5": "STOP_AT_ONE_PART" });
twoHarness.routeFra14FinalEvidence(2, ["FRA-14-M2", "FRA-14-M4", "FRA-14-M5"]);
assert.equal(twoHarness.state.exit.remediation.route, "score_zero_to_two_repair_and_fresh_five");
assert.deepEqual([...twoHarness.state.exit.remediation.recoveryIds], ["RM1", "RM2", "RM3", "RM4", "RM5"].map((id) => `FRA-14-${id}`));
assert.match(twoHarness.state.cursor, /^RECOVERY:FRA-14-R-/);

console.log("FRA14 canonical validation, runtime parity, geometry, outcomes, migration, guided/hint/repair and final/recovery route tests: PASS");
