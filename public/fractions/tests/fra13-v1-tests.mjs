import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const fractionsDir = path.resolve(testsDir, "..");
const workspaceRoot = path.resolve(fractionsDir, "..");
const typescriptPath = path.join(workspaceRoot, "revily-site", "node_modules", "typescript", "lib", "typescript.js");
const ts = await import(pathToFileURL(typescriptPath).href);

const canonicalSource = fs.readFileSync(path.join(workspaceRoot, "FRA13_CANONICAL_SPEC.ts"), "utf8");
const compiled = ts.transpileModule(canonicalSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
  fileName: "FRA13_CANONICAL_SPEC.ts",
  reportDiagnostics: true
});
const compileErrors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.deepEqual(compileErrors, [], "FRA13 canonical TypeScript must compile without errors");
const sourceModule = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: sourceModule, exports: sourceModule.exports }, { filename: "FRA13_CANONICAL_SPEC.ts" });
assert.equal(sourceModule.exports.validateFRA13CanonicalSpec().length, 0, "validateFRA13CanonicalSpec() must pass in the repository");
sourceModule.exports.assertFRA13CanonicalSpec();

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
  crypto: { randomUUID: () => "fra13-test-attempt" },
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

load("js/fra13-approved-spec.js");
load("js/fra13-canonical.js");
load("js/fra13-visuals.js");
load("js/validators.js");
load("js/lesson-model.js");

const source = windowObject.RevilyFra13V1;
const canonical = windowObject.RevilyFra13Canonical;
const runtime = source.runtimeCopy;
assert.equal(Object.keys(runtime).length, 118, "the complete approved runtime registry must be present");
assert.equal(canonical.validateRuntimeContract().length, 0, "caption, cue, problem and runtime-copy contracts must pass");
assert.deepEqual(Object.keys(runtime), Object.keys(sourceModule.exports.FRA13_RUNTIME_COPY), "generated runtime IDs must match the TypeScript source");
for (const [id, entry] of Object.entries(runtime)) {
  assert.equal(entry.text, sourceModule.exports.FRA13_RUNTIME_COPY[id].text, `${id} runtime text must match the authoritative TypeScript`);
  assert.equal(entry.captionSource, "same_as_audio", `${id} caption must come from its spoken utterance`);
}

const baseSpec = {
  schema_version: "1.2",
  identity: { id: "FRA-13", title: "Find a Fraction of an Amount" },
  dependencies: {}, diagnostic: {}, retrieval_practice: {}, lesson: {}, completion: {},
  voice_and_script: {}, visual_language: {}, engine_capability_requirements: {}, experience_contract: { global_ui_copy: {} }
};
const spec = canonical.apply(baseSpec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-13-${id}`);
assert.equal(spec.canonical_lesson.version, "fra13-fraction-of-amount-v1");
assert.equal(spec.canonical_lesson.engine_profile, "fra13");
assert.equal(spec.diagnostic.enabled, false);
assert.deepEqual([...spec.diagnostic.question_refs], []);
assert.equal(spec.retrieval_practice.enabled, false);
assert.deepEqual([...spec.retrieval_practice.question_refs], []);
assert.deepEqual(Array.from(spec.lesson.teaching_steps, (step) => step.id), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "HANDOFF"]);
assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
assert.deepEqual([...spec.lesson.exit.primary_question_refs], ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-13-${id}`));
assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1", "F2 must remain on both guided routes");

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
for (const scene of spec.lesson.teaching_steps) {
  for (const line of Array.isArray(scene.narration.script) ? scene.narration.script : [scene.narration.script].filter(Boolean)) assert.ok(runtimeTexts.has(line), `${scene.id} narration escaped FRA13_RUNTIME_COPY`);
  for (const cue of scene.narration.sync_cues || []) {
    assert.ok(runtime[cue.utteranceId], `${cue.id} references a missing utterance`);
    assert.ok(runtime[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()), `${cue.id} anchor must be spoken by that utterance`);
  }
}
for (const item of spec.question_bank) {
  for (const utteranceId of item.runtimeUtteranceIds || []) assert.ok(runtime[utteranceId], `${item.id} references missing runtime copy ${utteranceId}`);
  const spokenValues = [item.scripts?.before_submit, item.scripts?.hint, item.scripts?.on_correct_reaction, item.scripts?.on_correct_math, item.scripts?.on_incorrect_reaction, item.scripts?.on_incorrect_attempt_1, item.scripts?.on_incorrect_attempt_2, item.scripts?.worked_narration, item.scripts?.reteach];
  const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten) : typeof value === "string" && value ? [value] : [];
  for (const line of spokenValues.flatMap(flatten)) assert.ok(runtimeTexts.has(line), `${item.id} contains non-authoritative Ryan text: ${line}`);
}

const validators = windowObject.RevilyValidators;
assert.equal(validators.validate(question("G1"), "7"), true);
assert.equal(validators.validate(question("G2"), { oneShare: "5", final: "15" }), true);
assert.equal(validators.validate(question("G2"), { oneShare: "5", final: "5" }), false);
assert.equal(validators.validate(question("I1"), "18.0"), true);
assert.equal(validators.validate(question("I2"), "£7.50"), true);
assert.equal(validators.validate(question("I2"), "750p"), true);
assert.equal(validators.validate(question("I2"), "£7.05"), false);
assert.equal(validators.parseMoneyPence("£20.00"), 2000);
assert.equal(validators.parseMoneyPence("2000 p"), 2000);
assert.equal(canonical.completedOperationOrderIsValid(25, 3, 5, ["25", "×", "3", "÷", "5"]), true, "a completed multiply-first equivalent method must be accepted");
assert.equal(canonical.completedOperationOrderIsValid(25, 3, 5, ["25", "×", "3"]), false, "an incomplete numerator-only method must not be accepted");

assert.deepEqual([...canonical.selectOutcomeUtteranceIds(question("G1"), "4", false)], ["G1.INCORRECT.GROUP_COUNT"]);
assert.deepEqual([...canonical.selectOutcomeUtteranceIds(question("G2"), { oneShare: "5", final: "5" }, false)], ["G2.INCORRECT.ONE_SHARE"]);
assert.deepEqual([...canonical.selectOutcomeUtteranceIds(question("F2"), "48 ÷ 5 × 8", false)], ["F2.INCORRECT.SWAP"]);
assert.deepEqual([...canonical.selectOutcomeUtteranceIds(question("I1"), "9", false)], ["I1.INCORRECT.ONE_SHARE"]);
assert.deepEqual([...canonical.selectOutcomeUtteranceIds(question("I2"), "£2.50", false)], ["I2.INCORRECT.ONE_SHARE"]);
assert.equal(canonical.classifyErrorFamily(question("F2"), "48 ÷ 5 × 8"), "divide_by_numerator");
assert.equal(canonical.classifyErrorFamily(question("M2"), "7"), "stops_after_one_share");
for (const family of ["stops_after_one_share", "wrong_grouping", "divide_by_numerator", "numerator_only"]) {
  assert.ok(spec.lesson.adaptive_pathway.repair_by_error_family[family], `${family} must have its specific repair`);
  assert.ok(spec.lesson.adaptive_pathway.fresh_checks_by_error_family[family]?.length, `${family} must have fresh evidence`);
}
for (const id of ["M1", "M2", "M3", "M4", "M5", "A1", "A2", "A3", "A4", "A5"]) {
  assert.equal(question(id).policy.hintPolicy, "none", `${id} must be unsupported`);
  assert.equal(question(id).policy.answerLocksOnSubmit, true, `${id} must lock before marking`);
  assert.equal(question(id).policy.solutionPolicy, "after_locked_submit", `${id} must hide working until lock`);
  assert.ok(question(id).scripts.worked_narration.length > 0, `${id} must point to canonical worked-check narration`);
}
for (const id of ["F1", "F2", "I1", "I2"]) {
  assert.equal(question(id).policy.hintPolicy, "optional");
  assert.equal(question(id).policy.requiresFreshNoHintConfirmationIfHintUsed, true);
}

const secureRecords = [
  { questionId: "FRA-13-M1", correct: true, evidenceFamily: "direct_calculation" },
  { questionId: "FRA-13-M2", correct: true, evidenceFamily: "direct_calculation" },
  { questionId: "FRA-13-M3", correct: true, evidenceFamily: "context_or_reasoning" },
  { questionId: "FRA-13-M4", correct: true, evidenceFamily: "context_or_reasoning" },
  { questionId: "FRA-13-M5", correct: false, evidenceFamily: "context_or_reasoning", errorFamily: "stops_after_one_share" }
];
assert.equal(canonical.evaluateFinalEvidence(secureRecords, 5).masterySatisfied, true);
const repeated = secureRecords.map((record, index) => index >= 3 ? { ...record, correct: false, errorFamily: "stops_after_one_share" } : record);
assert.equal(canonical.evaluateFinalEvidence(repeated, 5).masterySatisfied, false);
assert.deepEqual([...canonical.selectRecoveryQuestionIds(["FRA-13-M3", "FRA-13-M4"], 2)], ["FRA-13-C-PROC", "FRA-13-C-MONEY"]);
assert.deepEqual([...canonical.selectRecoveryQuestionIds(["FRA-13-M1"], 5)], ["A1", "A2", "A3", "A4", "A5"].map((id) => `FRA-13-${id}`));

const visuals = windowObject.RevilyFra13Visuals;
const hookQuestion = question("HOOK-CHOICE");
const initialHook = visuals.renderMarkup(hookQuestion.visual, { question: hookQuestion, feedback: "initial" });
assert.ok(initialHook.includes("8 tokens"));
assert.ok(initialHook.includes("fra13-neutral-tokens"));
assert.ok(!initialHook.includes("12 tokens"), "hook must not reveal the computed reward before the choice");
assert.ok(!initialHook.includes("fra13-hook-groups"), "hook must not group the twenty tokens before the choice");
const revealedHook = visuals.renderMarkup(hookQuestion.visual, { question: hookQuestion, feedback: "worked" });
assert.ok(revealedHook.includes("12 tokens"));
assert.ok(revealedHook.includes("fra13-hook-groups"));
const m4Initial = visuals.renderMarkup(question("M4").visual, { question: question("M4"), feedback: "initial" });
assert.ok(!m4Initial.includes("fra13-working"), "final working must be absent before lock");
const m4Worked = visuals.renderMarkup(question("M4").visual, { question: question("M4"), feedback: "worked" });
assert.ok(m4Worked.includes("fra13-working"), "final working must appear after lock");

const model = windowObject.RevilyLessonModel.buildLessonModel(spec);
assert.equal(model.firstId, "HOOK");
assert.equal(model.getNode("G2").nextId, "F1");
assert.equal(model.getNode("F2").nextId, "I1");
assert.equal(model.exitIds.length, 5);

windowObject.RevilyVisuals = { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render() {} };
windowObject.RevilyNarrationSync = { NarrationSync: class NarrationSync { stop() {} } };
load("js/lesson-engine.js");
const LessonEngine = windowObject.RevilyLessonEngine.LessonEngine;
const storageKey = "revily.fractions.FRA-13.current.v1";
localStorage.setItem(storageKey, JSON.stringify({ version: 1, contentVersion: "legacy-fra13-yaml", topicId: "fractions", skillId: "FRA-13", cursor: "T08", drafts: { old: "stale" }, soundOn: false, developerOpen: true }));
const migrated = new LessonEngine({}, spec, {}, { topic: { id: "fractions", title: "Fractions", storageNamespace: "fractions" } });
assert.equal(migrated.state.cursor, "HOOK");
assert.equal(migrated.state.soundOn, false);
assert.equal(migrated.state.developerOpen, true);
assert.deepEqual({ ...migrated.state.drafts }, {});
assert.equal(migrated.state.contentMigration.to, "fra13-fraction-of-amount-v1");

const routeHarness = Object.create(LessonEngine.prototype);
routeHarness.spec = spec;
routeHarness.model = model;
routeHarness.emit = () => {};
routeHarness.state = migrated.freshState();
for (const id of ["FRA-13-G1", "FRA-13-G2"]) routeHarness.state.evidence.firstAttemptCorrect[id] = true;
routeHarness.state.evidence.componentFirstAttemptCorrect["FRA-13-G2"] = { oneShare: true, final: true };
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F2", "strong guided evidence skips F1 only");
routeHarness.state.evidence.componentFirstAttemptCorrect["FRA-13-G2"].final = false;
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F1");

const resumeHarness = Object.create(LessonEngine.prototype);
resumeHarness.spec = spec;
resumeHarness.model = model;
resumeHarness.state = migrated.freshState();
resumeHarness.state.submissions["FRA-13-G1"] = [{ response: "4", correct: false }];
resumeHarness.state.feedback["FRA-13-G1"] = "first_incorrect";
resumeHarness.state.evidence.errorFamily["FRA-13-G1"] = "support_needed";
resumeHarness.state.evidence.candidateErrorFamily["FRA-13-G1"] = "wrong_grouping";
let restoredFeedback = null;
resumeHarness.showFeedback = (...args) => { restoredFeedback = args; };
resumeHarness.restoreFirstHint(model.getNode("G1"));
assert.equal(restoredFeedback[1], runtime["G1.INCORRECT.GROUP_COUNT"].text, "reload after a wrong answer must restore the exact outcome feedback");
assert.equal(restoredFeedback[3], "Try again");
assert.equal(resumeHarness.shouldStartNodeNarration(model.getNode("G1")), false, "reload after wrong feedback must not replay the pre-submit prompt");
resumeHarness.state.feedback["FRA-13-G1"] = null;
resumeHarness.state.evidence.hintOpened["FRA-13-G1"] = true;
assert.equal(resumeHarness.shouldStartNodeNarration(model.getNode("G1")), false, "reload after opening a hint must not replay the pre-submit prompt");

const finalHarness = Object.create(LessonEngine.prototype);
finalHarness.spec = spec;
finalHarness.model = model;
finalHarness.emit = () => {};
finalHarness.state = migrated.freshState();
model.exitIds.forEach((id, index) => { finalHarness.state.exit.responses[id] = { response: "test", correct: index !== 4 }; });
finalHarness.state.evidence.errorFamily["FRA-13-M5"] = "support_needed";
finalHarness.state.evidence.candidateErrorFamily["FRA-13-M5"] = "stops_after_one_share";
finalHarness.routeFra13FinalEvidence(4, ["FRA-13-M5"]);
assert.equal(finalHarness.state.exit.result, "SECURE", "4/5 with direct plus context/reasoning evidence must be secure");

const miniHarness = Object.create(LessonEngine.prototype);
miniHarness.spec = spec;
miniHarness.model = model;
miniHarness.emit = () => {};
miniHarness.state = migrated.freshState();
const miniCorrect = new Set(["FRA-13-M1", "FRA-13-M2", "FRA-13-M3"]);
model.exitIds.forEach((id) => { miniHarness.state.exit.responses[id] = { response: "test", correct: miniCorrect.has(id) }; });
miniHarness.state.exit.missedPrimaryIds = ["FRA-13-M4", "FRA-13-M5"];
miniHarness.state.evidence.candidateErrorFamily["FRA-13-M4"] = "stops_after_one_share";
miniHarness.state.evidence.candidateErrorFamily["FRA-13-M5"] = "stops_after_one_share";
miniHarness.routeFra13FinalEvidence(3, miniHarness.state.exit.missedPrimaryIds);
assert.equal(miniHarness.state.exit.remediation.route, "score_three_two_fresh");
assert.equal(miniHarness.state.exit.remediation.recoveryIds.length, 2);
assert.match(miniHarness.state.cursor, /^RECOVERY:FRA-13-R-ONE$/);

const cappedHarness = Object.create(LessonEngine.prototype);
cappedHarness.spec = spec;
cappedHarness.model = model;
cappedHarness.emit = () => {};
cappedHarness.state = migrated.freshState();
model.exitIds.forEach((id) => { cappedHarness.state.exit.responses[id] = { response: "test", correct: miniCorrect.has(id) }; });
cappedHarness.state.evidence.candidateErrorFamily["FRA-13-M4"] = "stops_after_one_share";
cappedHarness.state.evidence.candidateErrorFamily["FRA-13-M5"] = "stops_after_one_share";
cappedHarness.state.evidence.repairCyclesUsed.stops_after_one_share = 1;
cappedHarness.routeFra13FinalEvidence(3, ["FRA-13-M4", "FRA-13-M5"]);
assert.equal(cappedHarness.state.exit.result, "NEEDS_WORK", "exhausting the approved per-family repair cap must stop recovery");
assert.equal(cappedHarness.state.exit.remediation.route, "repair_cycle_cap_reached");

const alternateHarness = Object.create(LessonEngine.prototype);
alternateHarness.spec = spec;
alternateHarness.model = model;
alternateHarness.emit = () => {};
alternateHarness.state = migrated.freshState();
const twoCorrect = new Set(["FRA-13-M1", "FRA-13-M3"]);
model.exitIds.forEach((id) => { alternateHarness.state.exit.responses[id] = { response: "test", correct: twoCorrect.has(id) }; });
alternateHarness.state.exit.missedPrimaryIds = model.exitIds.filter((id) => !twoCorrect.has(id));
alternateHarness.state.evidence.candidateErrorFamily["FRA-13-M2"] = "numerator_only";
alternateHarness.state.evidence.candidateErrorFamily["FRA-13-M4"] = "stops_after_one_share";
alternateHarness.routeFra13FinalEvidence(2, alternateHarness.state.exit.missedPrimaryIds);
assert.equal(alternateHarness.state.exit.remediation.route, "score_zero_to_two_alternate_final");
assert.deepEqual([...alternateHarness.state.exit.remediation.recoveryIds], ["A1", "A2", "A3", "A4", "A5"].map((id) => `FRA-13-${id}`));
assert.equal(spec.lesson.exit.mastery_policy.repairCycleCapPerFamily, 1);

console.log("FRA13 canonical, runtime parity, validators, visuals, migration, guided skip, repair and final-route tests: PASS");
