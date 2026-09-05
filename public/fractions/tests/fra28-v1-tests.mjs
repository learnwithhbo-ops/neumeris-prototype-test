import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const fractionsDir = path.resolve(testsDir, "..");
const typescriptPath = [
  path.resolve(fractionsDir, "../revily-site/node_modules/typescript/lib/typescript.js"),
  path.resolve(fractionsDir, "../../node_modules/typescript/lib/typescript.js")
].find((candidate) => fs.existsSync(candidate));
assert.ok(typescriptPath, "the bundled TypeScript dependency must be available");
const typescriptModule = await import(pathToFileURL(typescriptPath).href);
const ts = typescriptModule.default || typescriptModule;

const canonicalSource = fs.readFileSync(path.join(fractionsDir, "FRA28_CANONICAL_SPEC.ts"), "utf8");
const compiled = ts.transpileModule(canonicalSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
  fileName: "FRA28_CANONICAL_SPEC.ts",
  reportDiagnostics: true
});
const compileErrors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.equal(compileErrors.length, 0, "FRA28 canonical TypeScript must compile without errors");
const sourceModule = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: sourceModule, exports: sourceModule.exports }, { filename: "FRA28_CANONICAL_SPEC.ts" });
assert.deepEqual([...sourceModule.exports.validateFRA28CanonicalSpec()], [], "validateFRA28CanonicalSpec() must pass in the repository");

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
  crypto: { randomUUID: () => "fra28-test-attempt" },
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

load("js/fra28-approved-spec.js");
load("js/fra28-canonical.js");
load("js/fra28-visuals.js");
load("js/validators.js");
load("js/lesson-model.js");

const approved = windowObject.RevilyFra28Approved;
const runtime = windowObject.FRA28_RUNTIME_COPY;
const canonical = windowObject.RevilyFra28Canonical;
assert.equal(Object.keys(runtime).length, 69, "all approved FRA28 runtime utterances must be present");
assert.equal(approved.speechLedCues.length, 57, "all approved FRA28 speech-led cues must be present");
assert.deepEqual([...canonical.validateRuntimeContract()], [], "runtime/caption/cue validation must pass");
assert.deepEqual(Object.keys(runtime), Object.keys(sourceModule.exports.FRA28_RUNTIME_COPY), "generated and TypeScript runtime IDs must match");
for (const [id, entry] of Object.entries(runtime)) {
  assert.equal(entry.text, sourceModule.exports.FRA28_RUNTIME_COPY[id].text, `${id} text must match the authoritative TypeScript`);
  assert.equal(entry.captionSource, "same_as_audio", `${id} captions must resolve from the same runtime utterance`);
}

const baseSpec = {
  schema_version: "1.2",
  identity: { id: "FRA-28", title: "Divide by a Fraction" },
  dependencies: { required_skill_refs: ["FRA-24", "FRA-26", "FRA-27"] },
  diagnostic: {}, retrieval_practice: {}, lesson: {}, completion: {},
  voice_and_script: {}, visual_language: {}, engine_capability_requirements: {}, experience_contract: { global_ui_copy: {} }
};
const spec = canonical.apply(baseSpec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-28-${id}`);

assert.equal(spec.canonical_lesson.version, "FRA28-HANDOFF-V1");
assert.equal(spec.canonical_lesson.engine_profile, "fra28");
assert.deepEqual(Array.from(spec.lesson.teaching_steps, (step) => step.id), ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF"]);
assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
assert.deepEqual([...spec.lesson.exit.primary_question_refs], ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-28-${id}`));
assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1", "both routes must retain F2");
assert.deepEqual(Array.from(spec.diagnostic.question_refs), [], "FRA28 must not add Diagnostic");
assert.equal(spec.retrieval_practice.enabled, false, "FRA28 must not add Retrieval");

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten) : typeof value === "string" && value ? [value] : [];
for (const scene of spec.lesson.teaching_steps) {
  for (const line of flatten(scene.narration.script)) assert.ok(runtimeTexts.has(line), `${scene.id} narration escaped FRA28_RUNTIME_COPY`);
  for (const cue of scene.narration.sync_cues || []) {
    assert.ok(runtime[cue.utteranceId], `${cue.id} has no utterance`);
    assert.ok(runtime[cue.utteranceId].text.includes(cue.cue), `${cue.id} anchor is absent from its utterance`);
  }
}
for (const item of spec.question_bank) {
  const spoken = [item.scripts?.before_submit, item.scripts?.on_correct_reaction, item.scripts?.on_incorrect_reaction, item.scripts?.reteach].flatMap(flatten);
  for (const line of spoken) assert.ok(runtimeTexts.has(line), `${item.id} contains non-authoritative Ryan speech: ${line}`);
  assert.equal(Object.prototype.hasOwnProperty.call(item, "captionText"), false, `${item.id} must not define captionText`);
}
const usedCueIds = new Set([
  ...spec.lesson.teaching_steps.flatMap((scene) => scene.narration.sync_cues || []),
  ...spec.question_bank.flatMap((item) => item.visual?.syncCues || [])
].map((cue) => cue.id));
for (const cue of approved.speechLedCues) assert.ok(usedCueIds.has(cue.id), `${cue.id} must be attached to its runtime scene or question`);

const pair = (value) => ({ n: String(value.numerator), d: String(value.denominator) });
function correctResponse(raw, converted) {
  const answer = raw.answer;
  if (answer.kind === "integer") return String(answer.value);
  if (answer.kind === "fraction") return pair(answer.value);
  if (answer.kind === "choice") return converted.response.options.find((label) => converted.response.optionIds[label] === answer.optionId);
  if (answer.kind === "choice_and_fraction") return { choice: converted.response.options.find((label) => converted.response.optionIds[label] === answer.optionId), quotient: pair(answer.quotient) };
  if (answer.kind === "reciprocal_and_quotient") return { reciprocal: pair(answer.reciprocal), quotient: pair(answer.quotient) };
  if (answer.kind === "range_and_fraction") return { range: converted.response.options.find((label) => converted.response.optionIds[label] === answer.rangeId), quotient: pair(answer.quotient) };
  throw new Error(`Unsupported answer kind ${answer.kind}`);
}

function wrongResponse(raw, converted) {
  const answer = raw.answer;
  if (answer.kind === "integer") return String(answer.value + 1);
  if (answer.kind === "fraction") return { n: String(answer.value.numerator + 1), d: String(answer.value.denominator) };
  if (answer.kind === "choice") return converted.response.options.find((label) => converted.response.optionIds[label] !== answer.optionId);
  if (answer.kind === "choice_and_fraction") return { choice: converted.response.options.find((label) => converted.response.optionIds[label] === answer.optionId), quotient: { n: String(answer.quotient.numerator + 1), d: String(answer.quotient.denominator) } };
  if (answer.kind === "reciprocal_and_quotient") return { reciprocal: { n: String(answer.reciprocal.numerator + 1), d: String(answer.reciprocal.denominator) }, quotient: pair(answer.quotient) };
  if (answer.kind === "range_and_fraction") return { range: converted.response.options.find((label) => converted.response.optionIds[label] !== answer.rangeId), quotient: pair(answer.quotient) };
  throw new Error(`Unsupported answer kind ${answer.kind}`);
}

const authoredQuestions = [...approved.questions, ...approved.confirmations, ...approved.repairChecks, ...approved.recoveryBank];
for (const raw of authoredQuestions) {
  const converted = question(raw.id);
  assert.ok(converted, `${raw.id} must be in the runtime question bank`);
  const right = canonical.evaluateResponse(converted, correctResponse(raw, converted));
  assert.equal(right.correct, true, `${raw.id} correct response was rejected`);
  assert.deepEqual([...right.utteranceIds], [...raw.feedback.correct.utteranceIds], `${raw.id} correct branch changed`);
  const wrong = canonical.evaluateResponse(converted, wrongResponse(raw, converted));
  assert.equal(wrong.correct, false, `${raw.id} wrong response was accepted`);
  const expectedWrong = raw.feedback.byErrorFamily?.[wrong.errorFamily]?.utteranceIds || raw.feedback.incorrectDefault.utteranceIds;
  assert.deepEqual([...wrong.utteranceIds], [...expectedWrong], `${raw.id} must play exactly one matching incorrect branch`);
  assert.ok(!wrong.utteranceIds.some((id) => raw.feedback.correct.utteranceIds.includes(id)), `${raw.id} incorrect branch must not play correct speech`);
  assert.notEqual(wrong.visibleText, right.visibleText, `${raw.id} visible correct and incorrect feedback must differ`);
  assert.equal(converted.policy.answerLocksOnSubmit, true, `${raw.id} must lock on submit`);
  assert.equal(converted.policy.commitResponseBeforeOutcome, true, `${raw.id} must commit before outcome selection`);
  assert.equal(canonical.validateQuestionModel(converted).length, 0, `${raw.id} math model must validate`);
}

assert.equal(canonical.evaluateResponse(question("M1"), { n: "30", d: "8" }).correct, true, "equivalent exact fractions must be accepted");
assert.equal(canonical.evaluateResponse(question("I2"), "6").correct, true, "integer context answers must be accepted");
assert.equal(canonical.evaluateResponse(question("M3"), { reciprocal: { n: "15", d: "14" }, quotient: { n: "10", d: "16" } }).correct, true, "structured equivalent quotient must be accepted");

for (const id of ["I1", "I2"]) {
  assert.equal(question(id).policy.hintPolicy, "optional", `${id} hint must start collapsed and optional`);
  assert.equal(question(id).policy.requiresFreshNoHintConfirmationIfHintUsed, true, `${id} hint use must require a clean confirmation`);
}
assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question["FRA-28-I1"], "FRA-28-C-INT");
assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question["FRA-28-I2"], "FRA-28-C-CTX");
for (const id of ["M1", "M2", "M3", "M4", "M5", "RC1", "RC2", "RC3", "RC4", "RC5"]) {
  assert.equal(question(id).policy.hintPolicy, "none", `${id} must have no hint`);
  assert.equal(question(id).policy.solutionPolicy, "after_locked_submit", `${id} working must stay hidden until lock`);
}
for (const [family, repair] of Object.entries(approved.routing.errorToRepair)) {
  assert.equal(spec.lesson.adaptive_pathway.repair_by_error_family[family], `FRA-28-${repair}`);
  assert.ok(spec.lesson.adaptive_pathway.fresh_checks_by_error_family[family]?.length, `${family} must have a fresh repair check`);
}

assert.equal(canonical.chooseGuidedRoute({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: true, supportEscalated: false, centralMisconceptionObserved: false, duplicateSubmission: false }), "fast_skip_f1_keep_f2");
assert.equal(canonical.chooseGuidedRoute({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: true, supportEscalated: true, centralMisconceptionObserved: false, duplicateSubmission: false }), "standard_f1_then_f2");
assert.equal(canonical.confirmationAfterHint("I1", true, true), "C-INT");
assert.equal(canonical.confirmationAfterHint("I2", true, true), "C-CTX");

const secureRecords = [
  { family: "final_direct_integer", correct: true, firstAttemptCorrect: true },
  { family: "final_below_one", correct: true, firstAttemptCorrect: true },
  { family: "final_missing_reciprocal", correct: true, firstAttemptCorrect: true },
  { family: "final_error_reasoning", correct: true, firstAttemptCorrect: true },
  { family: "final_context", correct: false, firstAttemptCorrect: false, errorFamily: "ARITHMETIC_SLIP" }
];
assert.equal(canonical.evaluateFinalEvidence(secureRecords).masterySatisfied, true, "4/5 with procedural and reasoning evidence must finish");
const blockedRecords = secureRecords.map((record, index) => index >= 3 ? { ...record, correct: false, firstAttemptCorrect: false, errorFamily: "FLIP_BOTH" } : record);
assert.equal(canonical.evaluateFinalEvidence(blockedRecords).masterySatisfied, false, "a repeated blocking misconception must prevent finish");
assert.equal(canonical.evaluateFinalEvidence(blockedRecords).route, "repair_then_two_item_mini_check");
assert.deepEqual([...canonical.selectRecoveryQuestionIds(["FRA-28-M2", "FRA-28-M5"], 2)], ["FRA-28-RC2", "FRA-28-RC5"]);

const visuals = windowObject.RevilyFra28Visuals;
const hookInitial = visuals.renderMarkup(question("HOOK").visual, { question: question("HOOK"), feedback: "initial" });
assert.ok(hookInitial.includes("fra28-strip"), "the hook must render the approved three-quarter measurement strip");
assert.equal((hookInitial.match(/class="fra28-group-bracket"/g) || []).length, 0, "the hook must not reveal the six measured groups before submission");
const g1Initial = visuals.renderMarkup(question("G1").visual, { question: question("G1"), feedback: "initial" });
assert.equal((g1Initial.match(/fra28-group-bracket/g) || []).length, 0, "G1 must not pre-count the five groups");
const g1Worked = visuals.renderMarkup(question("G1").visual, { question: question("G1"), feedback: "worked" });
assert.equal((g1Worked.match(/class="fra28-group-bracket"/g) || []).length, 5, "G1 must reveal exactly five measured groups after lock");
const i2Initial = visuals.renderMarkup(question("I2").visual, { question: question("I2"), feedback: "initial" });
assert.equal((i2Initial.match(/class="fra28-pot"/g) || []).length, 1, "I2 must show one sample pot before submit");
const i2Worked = visuals.renderMarkup(question("I2").visual, { question: question("I2"), feedback: "worked" });
assert.equal((i2Worked.match(/class="fra28-pot"/g) || []).length, 6, "I2 must reveal six pots only after lock");
const m3Initial = visuals.renderMarkup(question("M3").visual, { question: question("M3"), feedback: "initial" });
assert.ok(!m3Initial.includes("fra28-reciprocal-card"), "M3 reciprocal must remain hidden before submit");
const m3Worked = visuals.renderMarkup(question("M3").visual, { question: question("M3"), feedback: "worked" });
assert.ok(m3Worked.includes("fra28-reciprocal-card"), "M3 reciprocal must reveal after lock");

const model = windowObject.RevilyLessonModel.buildLessonModel(spec);
assert.equal(model.firstId, "HOOK");
assert.equal(model.getNode("G2").nextId, "F1");
assert.equal(model.getNode("F2").nextId, "I1");
assert.equal(model.exitIds.length, 5);

windowObject.RevilyVisuals = { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render() {} };
windowObject.RevilyNarrationSync = { NarrationSync: class NarrationSync { stop() {} } };
load("js/lesson-engine.js");
const LessonEngine = windowObject.RevilyLessonEngine.LessonEngine;
const storageKey = "revily.fractions.FRA-28.current.v1";
localStorage.setItem(storageKey, JSON.stringify({ version: 1, contentVersion: "legacy-fra28-yaml", topicId: "fractions", skillId: "FRA-28", attemptId: "old-attempt", status: "SECURE", cursor: "T08", drafts: { old: "stale" }, submissions: { old: [{ response: "stale" }] }, exit: { result: "SECURE" }, soundOn: false, developerOpen: true }));
const migrated = new LessonEngine({}, spec, {}, { topic: { id: "fractions", title: "Fractions", storageNamespace: "fractions" } });
assert.equal(migrated.state.cursor, "HOOK");
assert.equal(migrated.state.soundOn, false);
assert.equal(migrated.state.developerOpen, true);
assert.deepEqual({ ...migrated.state.drafts }, {});
assert.equal(migrated.state.contentMigration.to, "FRA28-HANDOFF-V1");
const history = JSON.parse(localStorage.getItem("revily.fractions.FRA-28.history.v1"));
assert.equal(history.at(-1).completionResult, "SECURE", "old completion must be archived during migration");

const routeHarness = Object.create(LessonEngine.prototype);
routeHarness.spec = spec;
routeHarness.model = model;
routeHarness.emit = () => {};
routeHarness.state = migrated.freshState();
routeHarness.state.evidence.firstAttemptCorrect["FRA-28-G1"] = true;
routeHarness.state.evidence.firstAttemptCorrect["FRA-28-G2"] = true;
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F2", "strong route must skip F1 and keep F2");
routeHarness.state.evidence.candidateErrorFamily["FRA-28-G2"] = "NO_RECIPROCAL";
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F1", "central evidence must use the standard route");
routeHarness.state.evidence.pendingNoHintConfirmations = ["FRA-28-C-CTX"];
assert.equal(routeHarness.adaptiveNextId(model.getNode("I2")), "FRESH:FRA-28-C-CTX", "I2 hint evidence must route to C-CTX before final");

function finalHarness(correctIds, candidates) {
  const harness = Object.create(LessonEngine.prototype);
  harness.spec = spec;
  harness.model = model;
  harness.emit = () => {};
  harness.persist = () => {};
  harness.render = () => {};
  harness.state = migrated.freshState();
  model.exitIds.forEach((id) => {
    const correct = correctIds.has(id);
    harness.state.exit.responses[id] = { response: "test", correct };
    harness.state.evidence.firstAttemptCorrect[id] = correct;
    if (!correct && candidates?.[id]) harness.state.evidence.candidateErrorFamily[id] = candidates[id];
  });
  return harness;
}

const fourHarness = finalHarness(new Set(["FRA-28-M1", "FRA-28-M2", "FRA-28-M3", "FRA-28-M4"]), { "FRA-28-M5": "ARITHMETIC_SLIP" });
fourHarness.routeFra28FinalEvidence(4, ["FRA-28-M5"]);
assert.equal(fourHarness.state.exit.result, "SECURE", "secure 4/5 must finish");

const threeHarness = finalHarness(new Set(["FRA-28-M1", "FRA-28-M2", "FRA-28-M4"]), { "FRA-28-M3": "RECIPROCAL_FORM", "FRA-28-M5": "NO_RECIPROCAL" });
threeHarness.routeFra28FinalEvidence(3, ["FRA-28-M3", "FRA-28-M5"]);
assert.equal(threeHarness.state.exit.remediation.route, "repair_then_two_item_mini_check");
assert.deepEqual([...threeHarness.state.exit.remediation.recoveryIds], ["FRA-28-RC3", "FRA-28-RC5"]);
assert.match(threeHarness.state.cursor, /^RECOVERY:FRA-28-R-/);

const twoHarness = finalHarness(new Set(["FRA-28-M1", "FRA-28-M4"]), { "FRA-28-M2": "SMALLER_IMPOSSIBLE", "FRA-28-M3": "RECIPROCAL_FORM", "FRA-28-M5": "NO_RECIPROCAL" });
twoHarness.routeFra28FinalEvidence(2, ["FRA-28-M2", "FRA-28-M3", "FRA-28-M5"]);
assert.equal(twoHarness.state.exit.remediation.route, "repair_then_three_item_final");
assert.deepEqual([...twoHarness.state.exit.remediation.recoveryIds], ["FRA-28-RC2", "FRA-28-RC3", "FRA-28-RC5"]);

console.log("FRA28 canonical validation, registry/cue parity, exact outcomes, visuals, migration, guided/hint/repair and final/recovery routes: PASS");
