import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const testsRoot = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(testsRoot, "..");
const repositoryRoot = resolve(appRoot, "..");
const context = vm.createContext({
  window: {},
  console,
  URLSearchParams,
  setTimeout,
  clearTimeout,
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
});

async function load(relativePath) {
  const filePath = join(appRoot, relativePath);
  new vm.Script(await readFile(filePath, "utf8"), { filename: filePath }).runInContext(context);
}

await load("js/fra08-approved-spec.js");
await load("js/fra08-canonical.js");
await load("js/fra08-visuals.js");
await load("js/validators.js");
await load("js/lesson-model.js");

const canonical = context.window.RevilyFra08Canonical;
const approved = context.window.RevilyFra08V1.spec;
const runtime = context.window.RevilyFra08V1.runtimeCopy;
assert.equal(approved.contentVersion, "fra08-equivalent-fractions-v1");
assert.equal(Object.keys(runtime).length, 141);
assert.equal(approved.questions.length, 11);
assert.equal(approved.confirmationQuestions.length, 4);
assert.equal(approved.repairQuestions.length, 12);
assert.equal(approved.recoveryQuestions.length, 5);
assert.deepEqual([...canonical.validateRuntimeContract()], []);

const baseSpec = {
  schema_version: "1.2",
  identity: { id: "FRA-08", title: "Equivalent Fractions" },
  dependencies: {},
  diagnostic: {},
  retrieval_practice: {},
  lesson: {},
  completion: {},
  voice_and_script: {},
  visual_language: {},
  engine_capability_requirements: {},
  experience_contract: { global_ui_copy: {} }
};
const spec = canonical.apply(baseSpec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-08-${id}`);
assert.equal(spec.canonical_lesson.engine_profile, "fra08");
assert.equal(spec.canonical_lesson.version, "fra08-equivalent-fractions-v1");
assert.deepEqual([...spec.dependencies.required_skill_refs], ["FRA-01", "FRA-07", "P-N01"]);
assert.deepEqual([...spec.diagnostic.question_refs], []);
assert.equal(spec.retrieval_practice.enabled, false);
assert.deepEqual(Array.from(spec.lesson.teaching_steps, (step) => step.id), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "T5", "HANDOFF"]);
assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
assert.deepEqual([...spec.lesson.exit.primary_question_refs], ["FRA-08-M1", "FRA-08-M2", "FRA-08-M3", "FRA-08-M4", "FRA-08-M5"]);

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
for (const entry of Object.values(runtime)) assert.equal(entry.captionSource, "same_as_audio");
for (const step of spec.lesson.teaching_steps) {
  const lines = Array.isArray(step.narration.script) ? step.narration.script : [step.narration.script].filter(Boolean);
  for (const line of lines) assert.ok(runtimeTexts.has(line), `${step.id} narration escaped the runtime registry`);
  for (const cue of step.narration.sync_cues || []) {
    assert.ok(runtime[cue.utteranceId], `${cue.id} has no utterance`);
    assert.ok(runtime[cue.utteranceId].text.includes(cue.anchorText), `${cue.id} anchor is not exact`);
  }
}
for (const item of spec.question_bank) {
  for (const [key, value] of Object.entries(item.scripts || {})) {
    if (["worked_explanation", "response_feedback", "engagement_label"].includes(key)) continue;
    const lines = Array.isArray(value) ? value : [value];
    for (const line of lines.filter(Boolean)) assert.ok(runtimeTexts.has(line), `${item.id}.${key} is not canonical runtime copy`);
  }
}

assert.equal(question("G1").answer.value, "6");
assert.deepEqual({ ...question("G2").answer.value }, { factor: "3", value: "21" });
assert.equal(question("F1").answer.value, "20");
assert.equal(question("F2").answer.value, "10");
assert.equal(question("I1").answer.value, "12/44");
assert.equal(question("I2").answer.value, "15");
assert.deepEqual(Array.from(["M1", "M2", "M3", "M4", "M5"], (id) => question(id).answer.value), ["20/45", "21", "6", "4/10", "8"]);
assert.deepEqual(Array.from(["RF1", "RF2", "RF3", "RF4", "RF5"], (id) => question(id).answer.value), ["15/21", "24", "4", "6/8", "12"]);
for (const id of ["M1", "M2", "M3", "M4", "M5", "RF1", "RF2", "RF3", "RF4", "RF5"]) {
  assert.equal(question(id).policy.answerLocksOnSubmit, true, `${id} must lock before working`);
  assert.equal(question(id).policy.solutionPolicy, "after_locked_submit");
  assert.ok(question(id).scripts.worked_narration.length > 0, `${id} needs canonical worked narration`);
}

const wrongG1 = canonical.selectOutcomeUtteranceIds(question("G1"), "2", false);
const correctG1 = canonical.selectOutcomeUtteranceIds(question("G1"), "6", true);
assert.deepEqual([...wrongG1], ["G1.INCORRECT.UNCHANGED"]);
assert.deepEqual([...correctG1], ["G1.CORRECT"]);
assert.notEqual(runtime[wrongG1[0]].text, runtime[correctG1[0]].text);
assert.deepEqual([...canonical.selectOutcomeUtteranceIds(question("G2"), { factor: "2", value: null }, false)], ["G2.INCORRECT.FACTOR"]);
assert.deepEqual([...canonical.selectOutcomeUtteranceIds(question("G2"), { factor: "3", value: "20" }, false)], ["G2.INCORRECT.VALUE"]);
assert.deepEqual([...canonical.selectOutcomeUtteranceIds(question("I1"), { n: "6", d: "44" }, false)], ["I1.INCORRECT.MIXED"]);

const validators = context.window.RevilyValidators;
assert.equal(validators.validate(question("G2"), { factor: "3", value: "21" }), true);
assert.equal(validators.validate(question("G2"), { factor: "2", value: null }), false);
assert.equal(validators.validate(question("I1"), { n: "12", d: "44" }), true);
assert.equal(validators.validate(question("I1"), { n: "3", d: "11" }), false, "factor-specific answer must not auto-simplify");

assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.otherwise, "F1");
assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1", "F2 must remain on every guided route");
assert.deepEqual({ ...spec.lesson.adaptive_pathway.no_hint_confirmation_by_question }, {
  "FRA-08-F1": "FRA-08-C-UP",
  "FRA-08-F2": "FRA-08-C-DOWN",
  "FRA-08-I1": "FRA-08-C-FULL",
  "FRA-08-I2": "FRA-08-C-CONTEXT"
});
for (const family of ["one_numerator", "one_denominator", "mixed_factors", "additive", "direction", "fact"]) {
  assert.ok(spec.lesson.adaptive_pathway.repair_by_error_family[family], `${family} repair missing`);
  assert.ok(spec.lesson.adaptive_pathway.fresh_checks_by_error_family[family]?.length, `${family} fresh check missing`);
}

const secureRecords = [
  { questionId: "FRA-08-M1", family: "procedural_full_build", firstAttemptCorrect: true, independent: true, hintUsed: false },
  { questionId: "FRA-08-M2", family: "hidden_scale_up", firstAttemptCorrect: true, independent: true, hintUsed: false },
  { questionId: "FRA-08-M3", family: "reverse_scale_down", firstAttemptCorrect: true, independent: true, hintUsed: false },
  { questionId: "FRA-08-M4", family: "reasoning_error_analysis", firstAttemptCorrect: true, independent: true, hintUsed: false },
  { questionId: "FRA-08-M5", family: "visual_or_context_transfer", firstAttemptCorrect: false, independent: true, hintUsed: false, errorFamily: "one_denominator" }
];
assert.equal(canonical.evaluateFinalEvidence(secureRecords, true).masterySatisfied, true);
const perfectRecords = secureRecords.map((record) => ({ ...record, firstAttemptCorrect: true, errorFamily: null }));
assert.equal(canonical.evaluateFinalEvidence(perfectRecords, true).masterySatisfied, true, "5/5 with coverage must finish");
assert.equal(canonical.evaluateFinalEvidence(secureRecords.map((record) => ({ ...record, questionId: record.questionId === "FRA-08-M4" ? "FRA-08-M2" : record.questionId, family: "hidden_scale_up" })), true).masterySatisfied, false, "coverage is mandatory");
const repeatedBlocker = secureRecords.map((record, index) => index >= 3 ? { ...record, firstAttemptCorrect: false, errorFamily: "additive" } : record);
assert.deepEqual([...canonical.evaluateFinalEvidence(repeatedBlocker, true).repeatedBlockingFamilies], ["additive"]);
assert.deepEqual([...canonical.selectRecoveryQuestionIds(["FRA-08-M2", "FRA-08-M5"], 2)], ["FRA-08-RF2", "FRA-08-RF5"]);
assert.deepEqual([...canonical.selectRecoveryQuestionIds(["FRA-08-M1"], 5)], ["FRA-08-RF1", "FRA-08-RF2", "FRA-08-RF3", "FRA-08-RF4", "FRA-08-RF5"]);

const model = context.window.RevilyLessonModel.buildLessonModel(spec);
assert.equal(model.firstId, "HOOK");
assert.equal(model.getNode("G2").nextId, "F1");
assert.equal(model.getNode("M5").exit, true);

const storage = new Map();
context.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value))
};
context.window.location = { search: "" };
context.window.crypto = { randomUUID: () => "fra08-test-attempt" };
context.window.RevilyVisuals = { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render() {} };
context.window.RevilyNarrationSync = { NarrationSync: class NarrationSync { stop() {} } };
await load("js/lesson-engine.js");
const LessonEngine = context.window.RevilyLessonEngine.LessonEngine;
const storageKey = "revily.fractions.FRA-08.current.v1";
storage.set(storageKey, JSON.stringify({
  version: 1,
  contentVersion: "legacy-fra08-pilot",
  topicId: "fractions",
  skillId: "FRA-08",
  cursor: "T09",
  drafts: { "FRA-08-E01": "stale" },
  resolved: { "FRA-08-E01": "worked" },
  soundOn: false
}));
const migratedEngine = new LessonEngine({}, spec, {}, { topic: { id: "fractions", storageNamespace: "fractions" } });
assert.equal(migratedEngine.state.cursor, "HOOK");
assert.equal(migratedEngine.state.soundOn, false);
assert.deepEqual({ ...migratedEngine.state.drafts }, {});
assert.equal(migratedEngine.state.contentMigration.to, "fra08-equivalent-fractions-v1");
assert.ok(migratedEngine.state.contentMigration.cleared.includes("cues"));

const routeHarness = Object.create(LessonEngine.prototype);
routeHarness.spec = spec;
routeHarness.model = model;
routeHarness.emit = () => {};
routeHarness.state = migratedEngine.freshState();
routeHarness.state.evidence.firstAttemptCorrect["FRA-08-G1"] = true;
routeHarness.state.evidence.firstAttemptCorrect["FRA-08-G2"] = true;
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F2", "clean guided evidence must skip only F1");
routeHarness.state.evidence.supportEscalated["FRA-08-G1"] = true;
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F1");

const finalHarness = Object.create(LessonEngine.prototype);
finalHarness.spec = spec;
finalHarness.model = model;
finalHarness.emit = () => {};
finalHarness.state = migratedEngine.freshState();
const primaryIds = [...model.exitIds];
primaryIds.forEach((id, index) => {
  finalHarness.state.exit.responses[id] = { response: "test", correct: index !== 1 };
  finalHarness.state.evidence.firstAttemptCorrect[id] = index !== 1;
});
finalHarness.state.evidence.errorFamily["FRA-08-M2"] = "one_denominator";
finalHarness.routeFra08FinalEvidence(4, ["FRA-08-M2"]);
assert.equal(finalHarness.state.exit.result, "SECURE", "4/5 with procedural and M4/M5 coverage should finish");

const perfectHarness = Object.create(LessonEngine.prototype);
perfectHarness.spec = spec;
perfectHarness.model = model;
perfectHarness.emit = () => {};
perfectHarness.state = migratedEngine.freshState();
primaryIds.forEach((id) => {
  perfectHarness.state.exit.responses[id] = { response: "test", correct: true };
  perfectHarness.state.evidence.firstAttemptCorrect[id] = true;
});
perfectHarness.routeFra08FinalEvidence(5, []);
assert.equal(perfectHarness.state.exit.result, "SECURE", "5/5 with coverage should finish");

const recoveryHarness = Object.create(LessonEngine.prototype);
recoveryHarness.spec = spec;
recoveryHarness.model = model;
recoveryHarness.emit = () => {};
recoveryHarness.state = migratedEngine.freshState();
const threeCorrect = new Set(["FRA-08-M1", "FRA-08-M2", "FRA-08-M4"]);
primaryIds.forEach((id) => {
  const correct = threeCorrect.has(id);
  recoveryHarness.state.exit.responses[id] = { response: "test", correct };
  recoveryHarness.state.evidence.firstAttemptCorrect[id] = correct;
  if (!correct) recoveryHarness.state.evidence.errorFamily[id] = id.endsWith("M3") ? "direction" : "one_denominator";
});
recoveryHarness.routeFra08FinalEvidence(3, ["FRA-08-M3", "FRA-08-M5"]);
assert.equal(recoveryHarness.state.exit.remediation.recoveryIds.length, 2);
assert.match(recoveryHarness.state.cursor, /^RECOVERY:FRA-08-R-/);
assert.equal(recoveryHarness.state.pendingRecovery.fra08FinalRecovery, true);

const alternateHarness = Object.create(LessonEngine.prototype);
alternateHarness.spec = spec;
alternateHarness.model = model;
alternateHarness.emit = () => {};
alternateHarness.state = migratedEngine.freshState();
const twoCorrect = new Set(["FRA-08-M1", "FRA-08-M4"]);
primaryIds.forEach((id) => {
  const correct = twoCorrect.has(id);
  alternateHarness.state.exit.responses[id] = { response: "test", correct };
  alternateHarness.state.evidence.firstAttemptCorrect[id] = correct;
  if (!correct) alternateHarness.state.evidence.errorFamily[id] = "additive";
});
alternateHarness.routeFra08FinalEvidence(2, primaryIds.filter((id) => !twoCorrect.has(id)));
assert.deepEqual([...alternateHarness.state.exit.remediation.recoveryIds], ["FRA-08-RF1", "FRA-08-RF2", "FRA-08-RF3", "FRA-08-RF4", "FRA-08-RF5"]);
assert.equal(alternateHarness.state.pendingRecovery.fra08BaseIds.length, 0);

for (const score of [0, 1]) {
  const lowHarness = Object.create(LessonEngine.prototype);
  lowHarness.spec = spec;
  lowHarness.model = model;
  lowHarness.emit = () => {};
  lowHarness.state = migratedEngine.freshState();
  primaryIds.forEach((id, index) => {
    const correct = index < score;
    lowHarness.state.exit.responses[id] = { response: "test", correct };
    lowHarness.state.evidence.firstAttemptCorrect[id] = correct;
    if (!correct) lowHarness.state.evidence.errorFamily[id] = "additive";
  });
  const missed = primaryIds.filter((id) => !lowHarness.state.exit.responses[id].correct);
  lowHarness.routeFra08FinalEvidence(score, missed);
  assert.deepEqual([...lowHarness.state.exit.remediation.recoveryIds], ["FRA-08-RF1", "FRA-08-RF2", "FRA-08-RF3", "FRA-08-RF4", "FRA-08-RF5"], `${score}/5 must use the full alternate final`);
  assert.equal(lowHarness.state.pendingRecovery.fra08BaseIds.length, 0);
}

const visuals = context.window.RevilyFra08Visuals;
const m2Initial = visuals.renderMarkup({ model: question("M2").model }, { question: question("M2"), feedback: "initial" });
assert.ok(!m2Initial.includes(">21<"), "M2 visual leaked the answer before submit");
const m2Worked = visuals.renderMarkup({ model: question("M2").model }, { question: question("M2"), feedback: "worked" });
assert.ok(m2Worked.includes(">21<"), "M2 worked visual did not reveal the answer");
const accessibleBefore = visuals.accessibleDescription(question("M2").model, { question: question("M2"), feedback: "initial" });
assert.doesNotMatch(accessibleBefore, /missing value is now shown/i);
assert.match(visuals.accessibleDescription(question("M2").model, { question: question("M2"), feedback: "worked" }), /missing value is now shown/i);
const m5Initial = visuals.renderMarkup({ model: question("M5").model }, { question: question("M5"), feedback: "initial" });
assert.match(m5Initial, /2\/3/);
assert.doesNotMatch(m5Initial, /undefined/);

const engineSource = await readFile(join(appRoot, "js", "lesson-engine.js"), "utf8");
assert.match(engineSource, /fra08-equivalent-fractions-v1/);
assert.match(engineSource, /factor_then_integer/);
assert.match(engineSource, /answerLocked/);
assert.match(engineSource, /routeFra08FinalEvidence/);
assert.match(engineSource, /fra08FinalRecovery/);
assert.match(engineSource, /resetTo: "HOOK"/);
assert.match(engineSource, /this\.state = this\.freshState\(\)/, "Start Again must replace stale attempt state");
assert.match(engineSource, /this\.refocusInput\(\)/, "wrong-answer retry must remain interactive");
assert.match(engineSource, /this\.elements\.primary\.disabled = !this\.isFra08V1\(\)/, "FRA08 worked checks must not freeze while other lessons retain their narration lock");

const styles = await readFile(join(appRoot, "styles.css"), "utf8");
assert.match(styles, /\.fraction-input input[\s\S]*min-width: 72px/);
assert.match(styles, /@media \(max-width: 520px\)[\s\S]*\.fraction-input input[\s\S]*width: 78px/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);

for (const relativePath of ["js/fra08-approved-spec.js", "js/fra08-canonical.js", "js/fra08-visuals.js"]) {
  const sourceBytes = await readFile(join(appRoot, relativePath));
  const hostedBytes = await readFile(join(repositoryRoot, "revily-site", "public", "fractions", relativePath));
  const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
  assert.equal(digest(sourceBytes), digest(hostedBytes), `${relativePath} mirror is stale`);
}
const sharedMirrorContracts = {
  "index.html": [/fra08-approved-spec\.js/, /fra08-canonical\.js/, /fra08-visuals\.js/],
  "styles.css": [/\.fra08-context-visual/, /\.factor-then-integer-answer/],
  "js/skill-loader.js": [/RevilyFra08Canonical/],
  "js/validators.js": [/factor_then_integer/],
  "js/lesson-model.js": [/fra08_equivalent_fraction/],
  "js/lesson-engine.js": [/fra08-equivalent-fractions-v1/, /routeFra08FinalEvidence/, /fra08FinalRecovery/],
  "js/visual-primitives.js": [/fra08_context/, /RevilyFra08Visuals/]
};
for (const [relativePath, patterns] of Object.entries(sharedMirrorContracts)) {
  const sourceText = await readFile(join(appRoot, relativePath), "utf8");
  const hostedText = await readFile(join(repositoryRoot, "revily-site", "public", "fractions", relativePath), "utf8");
  for (const pattern of patterns) {
    assert.match(sourceText, pattern, `${relativePath} source lost ${pattern}`);
    assert.match(hostedText, pattern, `${relativePath} hosted mirror lost ${pattern}`);
  }
}

console.log("FRA08 v1 canonical, route, outcome, answer-lock, migration, visual, accessibility and mirror tests: PASS");
