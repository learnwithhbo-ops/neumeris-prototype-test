import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fractionsRoot = path.resolve(testDir, "..");
const context = { window: {}, console };
vm.createContext(context);

function load(relativePath) {
  vm.runInContext(fs.readFileSync(path.join(fractionsRoot, relativePath), "utf8"), context, { filename: relativePath });
}

load("js/fra27-approved-spec.js");
load("js/fra27-canonical.js");
load("js/fra27-visuals.js");

const source = context.window.RevilyFra27V1;
const adapter = context.window.RevilyFra27Canonical;
const visuals = context.window.RevilyFra27Visuals;
const fra27Css = fs.readFileSync(path.join(fractionsRoot, "fra27.css"), "utf8");
const routeHtml = fs.readFileSync(path.join(fractionsRoot, "index.html"), "utf8");
assert.match(fra27Css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(fra27Css, /min-height:\s*44px/);
for (const asset of ["fra27.css", "fra27-approved-spec.js", "fra27-canonical.js", "fra27-visuals.js", "fra27-runtime-bridge.js", "fra27-engine-extension.js"]) {
  assert.equal(routeHtml.includes(asset), true, `${asset} is not registered on the active route`);
}

const baseSpec = {
  identity: { id: "FRA-27", title: "Divide a Fraction by an Integer" },
  diagnostic: {},
  retrieval_practice: {},
  question_bank: [],
  lesson: { teaching_steps: [], transfer_steps: {}, practice: {}, exit: {} },
  completion: {},
  voice_and_script: {},
  visual_language: {},
  engine_capability_requirements: {},
  experience_contract: {},
};
const spec = adapter.apply(baseSpec);

assert.deepEqual(Array.from(source.validateFRA27CanonicalSpec()), []);
assert.deepEqual(Array.from(adapter.validateRuntimeContract()), []);
assert.equal(spec.canonical_lesson.version, "fra27-divide-fraction-by-integer-v1");
assert.equal(spec.canonical_lesson.engine_profile, "fra27");
assert.equal(spec.canonical_lesson.exact_runtime_copy, true);
assert.equal(spec.diagnostic.question_refs.length, 0);
assert.equal(spec.retrieval_practice.enabled, false);
assert.deepEqual(Array.from(spec.lesson.teaching_steps, (step) => step.id), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "HANDOFF"]);
assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
assert.deepEqual(Array.from(spec.lesson.exit.primary_question_refs), ["FRA-27-M1", "FRA-27-M2", "FRA-27-M3", "FRA-27-M4", "FRA-27-M5"]);

for (const [id, entry] of Object.entries(source.FRA27_RUNTIME_COPY)) {
  assert.equal(entry.provenance, "storyboard_exact", `${id} provenance changed`);
  assert.equal(entry.captionSource, "same_as_audio", `${id} caption source changed`);
  assert.equal(spec.canonical_lesson.runtime_copy[id].text, entry.text, `${id} runtime text drifted`);
}
for (const [id, entry] of Object.entries(source.FRA27_UI_COPY)) {
  assert.equal(entry.delivery, "visible_ui_only", `${id} must remain visible UI only`);
  assert.equal(source.FRA27_RUNTIME_COPY[id], undefined, `${id} leaked into the Ryan registry`);
}
for (const cue of source.FRA27_SPEECH_CUES) {
  const utterance = source.FRA27_RUNTIME_COPY[cue.utteranceId];
  assert.ok(utterance, `${cue.id} points to a missing utterance`);
  assert.equal(utterance.text.includes(cue.anchorText), true, `${cue.id} anchor is not present in its exact utterance`);
}

function question(id) {
  const found = spec.question_bank.find((item) => item.canonicalQuestionId === id);
  assert.ok(found, `missing ${id}`);
  return found;
}

function check(id, response) {
  return adapter.evaluateResponse(question(id), response);
}

assert.equal(check("G1", { trayCounts: [2, 2, 2], n: "2", d: "7" }).correct, true);
assert.equal(check("G1", { trayCounts: [3, 2, 1], n: "2", d: "7" }).correct, false);
assert.equal(check("G2", { reciprocal: "1/4", n: "5", d: "24" }).correct, true);
assert.equal(check("G2", { reciprocal: "4/1", n: "10", d: "3" }).errorFamily, "MULTIPLY");
assert.equal(check("F1", "2").correct, true);
assert.equal(check("F2", "7/8 x 3/1 = 21/8").errorFamily, "MULTIPLY");
assert.equal(check("I1", { n: "14", d: "60" }).correct, true, "equivalent exact fractions must be accepted");
assert.equal(check("I2", "Divide the denominator by 5, so the answer is 15/(8 divided by 5).").errorFamily, "DENOM_DIV");
assert.equal(check("M1", { n: "7", d: "60" }).correct, true);
assert.equal(check("M2", { n: "12", d: "20" }).correct, true);
assert.equal(check("M3", { reciprocal: "1/2", n: "5", d: "18" }).correct, true);
assert.equal(check("M4", { n: "7", d: "24" }).correct, true);
assert.equal(check("M5", question("M5").response.options.find((label) => question("M5").response.optionIds[label] === "B")).correct, true);
assert.equal(question("G2").response.entryMode, "choices");
assert.equal(question("M3").response.entryMode, "fields");

const explicitMethod = question("F2");
assert.equal(adapter.requiresRepeatedEvidence(explicitMethod, explicitMethod.response.options[1]), false);
assert.equal(adapter.requiresRepeatedEvidence(question("I1"), { n: "21", d: "10" }), true);

const g1Clean = { questionId: "G1", firstAttemptCorrect: true, componentFirstAttemptCorrect: {}, hintOpenedBeforeSubmit: false, supportEscalated: false, errorFamilyHypothesis: null };
const g2Clean = { questionId: "G2", firstAttemptCorrect: true, componentFirstAttemptCorrect: { reciprocal: true, product: true }, hintOpenedBeforeSubmit: false, supportEscalated: false, errorFamilyHypothesis: null };
assert.equal(source.shouldSkipF1(g1Clean, g2Clean), true);
assert.equal(source.shouldSkipF1(g1Clean, { ...g2Clean, componentFirstAttemptCorrect: { reciprocal: true, product: false } }), false);
assert.equal(source.confirmationQuestionFor("I1"), "C-RECIP");
assert.equal(source.confirmationQuestionFor("I2"), "C-DIRECT");

for (const [family, repairId] of Object.entries({ DENOM_DIV: "R-DEN", NUM_NONEXACT: "R-NUM", MULTIPLY: "R-MULT", FLIP_DIVIDEND: "R-FLIP", SUBTRACT: "R-SUB" })) {
  assert.equal(source.repairForFamily(family), repairId);
  const supported = question(`${repairId}-SUPPORTED`);
  const fresh = question(source.FRA27_REPAIRS[repairId].freshCheckQuestionId);
  assert.equal(adapter.evaluateResponse(supported, supported.answer.value).correct, true, `${repairId} supported answer must validate`);
  assert.equal(adapter.evaluateResponse(fresh, fresh.answer.value).correct, true, `${repairId} fresh answer must validate`);
}
const freshMultiply = question("R-MULT-FRESH");
const freshMultiplyVisual = visuals.renderMarkup(freshMultiply.visual, { question: freshMultiply, feedback: "initial" });
assert.doesNotMatch(freshMultiplyVisual, /Three copies|One of three shares/);
assert.doesNotMatch(freshMultiplyVisual, /3[\s\S]*28/);

const primaryRecord = (id, correct, family = null) => ({
  questionId: id,
  firstAttemptCorrect: correct,
  errorFamilyHypothesis: family,
});
assert.equal(source.evaluatePrimaryFinalRoute([
  primaryRecord("M1", true), primaryRecord("M2", true), primaryRecord("M3", true), primaryRecord("M4", true), primaryRecord("M5", false, "MULTIPLY"),
]).kind, "finish_candidate");
const miniRoute = source.evaluatePrimaryFinalRoute([
  primaryRecord("M1", true), primaryRecord("M2", true), primaryRecord("M3", true), primaryRecord("M4", false, "MULTIPLY"), primaryRecord("M5", false, "FLIP_DIVIDEND"),
]);
assert.equal(miniRoute.kind, "repair_then_two_item_mini_check");
assert.equal(miniRoute.questionIds.length, 2);
const alternateRoute = source.evaluatePrimaryFinalRoute([
  primaryRecord("M1", true), primaryRecord("M2", true), primaryRecord("M3", false, "MULTIPLY"), primaryRecord("M4", false, "DENOM_DIV"), primaryRecord("M5", false, "FLIP_DIVIDEND"),
]);
assert.equal(alternateRoute.kind, "repair_then_alternate_three");
assert.deepEqual(Array.from(alternateRoute.questionIds), ["A1", "A2", "A3"]);
assert.equal(source.evaluateRecoveryCompletion(["A1", "A2", "A3"], [primaryRecord("A1", true), primaryRecord("A2", true), primaryRecord("A3", true)]), "finish_candidate");
assert.equal(source.evaluateRecoveryCompletion(["A1", "A2", "A3"], [primaryRecord("A1", true), primaryRecord("A2", false), primaryRecord("A3", true)]), "restart_without_completion");

const initial = source.createInitialFRA27AttemptState();
assert.equal(initial.contentVersion, "fra27-divide-fraction-by-integer-v1");
assert.equal(initial.currentNodeId, "HOOK");
const reset = source.migrateFRA27AttemptState({ contentVersion: "legacy-fra27-yaml", currentNodeId: "M4", completed: true });
assert.equal(reset.currentNodeId, "HOOK");
assert.equal(reset.completed, false);
const resumed = source.migrateFRA27AttemptState({ ...initial, currentNodeId: "I2", activeFinalSet: "primary" });
assert.equal(resumed.currentNodeId, "I2");

const initialG1 = visuals.renderMarkup(question("G1").visual, { question: question("G1"), feedback: "initial" });
assert.match(initialG1, /data-fra27-tile="5"/);
assert.match(initialG1, /data-fra27-tray="2"/);
assert.doesNotMatch(initialG1, /2\/7/);
const initialI1 = visuals.renderMarkup(question("I1").visual, { question: question("I1"), feedback: "initial" });
assert.match(initialI1, /7\/10 L/);
assert.doesNotMatch(initialI1, /7\/30/);
const initialM1 = visuals.renderMarkup(question("M1").visual, { question: question("M1"), feedback: "initial" });
assert.doesNotMatch(initialM1, /7\/60/);
const initialM2 = visuals.renderMarkup(question("M2").visual, { question: question("M2"), feedback: "initial" });
assert.equal((initialM2.match(/fra27-share-tile/g) || []).length, 12);
assert.doesNotMatch(initialM2, /<button|data-fra27-move/);
const workedM2 = visuals.renderMarkup(question("M2").visual, { question: question("M2"), feedback: "worked" });
assert.equal((workedM2.match(/fra27-share-tile/g) || []).length, 12);
assert.equal((workedM2.match(/fra27-tray-drop/g) || []).length, 4);
const workedM1 = visuals.renderMarkup(question("M1").visual, { question: question("M1"), feedback: "worked" });
assert.match(workedM1, /7[\s\S]*60/);
assert.equal(question("M1").scripts.worked_explanation.includes("7/12 x 1/5 = 7/60"), true);

vm.runInContext(`
  window.RevilyValidators = { serialiseResponse: (value) => value };
  window.RevilyVisuals = { render() {} };
  window.RevilyLessonEngine = { LessonEngine: class LessonEngine {
    isRegistryRuntimeLesson() { return false; }
    adaptiveNextId() { return null; }
  } };
`, context);
load("js/fra27-engine-extension.js");
const Fra27Engine = context.window.RevilyFra27Engine.LessonEngine;
const engine = Object.create(Fra27Engine.prototype);
engine.spec = spec;
engine.emit = () => {};
engine.persist = () => {};
engine.render = () => {};
engine.model = { getQuestion: (id) => question(id.replace("FRA-27-", "")) };
engine.state = {
  cursor: "M5",
  pendingRecovery: null,
  freshContext: null,
  evidence: { pendingNoHintConfirmations: [], freshConfirmationPassed: {} },
  exit: {
    missedPrimaryIds: ["FRA-27-M4"],
    result: null,
    remediation: {
      profile: "fra27",
      route: "repair_then_two_item_mini_check",
      repairQueue: [{ family: "MULTIPLY", id: "FRA-27-R-MULT" }],
      repairIndex: 0,
      recoveryIds: ["FRA-27-MC-MULT-1", "FRA-27-MC-MULT-2"],
      recoveryIndex: 0,
      results: []
    }
  }
};
engine.queueFra27Confirmation("FRA-27-F2", "hint");
assert.deepEqual(Array.from(engine.state.evidence.pendingNoHintConfirmations), ["FRA-27-C-METHOD"]);
engine.beginNextFra27RecoveryStep();
assert.equal(engine.state.cursor, "RECOVERY:FRA-27-R-MULT");
assert.equal(engine.state.pendingRecovery.fra27FinalRecovery, true);
engine.beginNextFra27RecoveryStep();
assert.equal(engine.state.cursor, "FRESH:FRA-27-MC-MULT-1");
engine.state.exit.remediation.results = [primaryRecord("MC-MULT-1", true), primaryRecord("MC-MULT-2", true)];
engine.finishFra27RecoverySequence();
assert.equal(engine.state.exit.result, "SECURE");
engine.state.exit.remediation.results = [primaryRecord("MC-MULT-1", true), primaryRecord("MC-MULT-2", false, "MULTIPLY")];
engine.finishFra27RecoverySequence();
assert.equal(engine.state.exit.result, "NEEDS_WORK");

console.log("FRA27 canonical package, copy firewall, exact validators, routes, repairs, migration and visual leakage tests: PASS");
