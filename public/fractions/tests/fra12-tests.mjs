import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(testDir, "../..");
const require = createRequire(import.meta.url);
const ts = require(path.join(workspaceRoot, "revily-site/node_modules/typescript/lib/typescript.js"));
const yaml = require(path.join(workspaceRoot, "revily-site/node_modules/js-yaml/index.js"));
const { unzipSync, strFromU8 } = require(path.join(workspaceRoot, "revily-site/node_modules/fflate/lib/index.cjs"));

function loadOwnerSource() {
  const archive = unzipSync(new Uint8Array(fs.readFileSync(path.join(workspaceRoot, "Revily_FRA12_Codex_Handoff_v1.zip"))));
  const entry = Object.keys(archive).find((name) => name.endsWith("/FRA12_CANONICAL_SPEC.ts") || name === "FRA12_CANONICAL_SPEC.ts");
  assert.ok(entry, "owner FRA12 canonical TypeScript exists in the handoff");
  const compiled = ts.transpileModule(strFromU8(archive[entry]), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
    fileName: "FRA12_CANONICAL_SPEC.ts",
    reportDiagnostics: true
  });
  const errors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors, [], "owner FRA12 TypeScript transpiles without errors");
  const record = { exports: {} };
  vm.runInNewContext(compiled.outputText, { exports: record.exports, module: record }, { filename: entry });
  return record.exports;
}

function requireFresh(relativePath) {
  const target = path.join(workspaceRoot, relativePath);
  delete require.cache[require.resolve(target)];
  require(target);
}

const owner = loadOwnerSource();
assert.deepEqual(Array.from(owner.validateFRA12CanonicalSpec()), [], "validateFRA12CanonicalSpec passes");
assert.equal(Object.keys(owner.FRA12_RUNTIME_COPY).length, 182, "owner runtime has 182 authored Ryan utterances");
assert.equal(owner.FRA12_SYNC_CUES.length, 30, "owner runtime has 30 authored cues");

global.window = {};
requireFresh("fractions/js/fra12-approved-spec.js");
requireFresh("fractions/js/fra12-canonical.js");
requireFresh("fractions/js/validators.js");
requireFresh("fractions/js/lesson-model.js");

const canonical = window.RevilyFra12Canonical;
const runtime = window.RevilyFra12V1.runtimeCopy;
assert.deepEqual(canonical.validateRuntimeContract(), [], "browser runtime copy/caption/cue contract passes");
assert.deepEqual(window.RevilyFra12V1.spec, JSON.parse(JSON.stringify(owner.FRA12)), "generated browser spec matches the owner TypeScript object");

const legacyPath = path.join(workspaceRoot, "FRA 01 to 28/revily_fractions_v1_2/skills/FRA-12_COMPLETE_v1.2.yaml");
const spec = canonical.apply(yaml.load(fs.readFileSync(legacyPath, "utf8")));
const model = window.RevilyLessonModel.buildLessonModel(spec);
assert.equal(spec.identity.id, "FRA-12");
assert.equal(spec.canonical_lesson.version, "fra12-owner-approved-handoff-v1");
assert.deepEqual(spec.dependencies.required_skill_refs, ["FRA-02", "FRA-06"]);
assert.deepEqual(spec.diagnostic.question_refs, []);
assert.equal(spec.retrieval_practice.enabled, false);
assert.deepEqual(model.nodes.map((node) => node.id), ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF", "G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"]);
assert.deepEqual(spec.lesson.adaptive_pathway.skip_after.G2, {
  type: "guided_strong",
  questionRefs: ["FRA-12-G1", "FRA-12-G2"],
  next: "F2",
  otherwise: "F1"
});
assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1", "F2 remains on both guided routes");
assert.deepEqual(model.exitIds, ["FRA-12-M1", "FRA-12-M2", "FRA-12-M3", "FRA-12-M4", "FRA-12-M5"]);
assert.equal(spec.question_bank.length, 34, "all canonical, repair, confirmation, final, and recovery questions are registered once");
assert.deepEqual(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question, {
  "FRA-12-F1": "FRA-12-C-VIS",
  "FRA-12-F2": "FRA-12-C-METHOD",
  "FRA-12-I1": "FRA-12-C-VIS",
  "FRA-12-I2": "FRA-12-C-METHOD"
}, "every optional-hint success has an authored fresh no-hint confirmation");
assert.deepEqual(spec.lesson.adaptive_pathway.repair_by_error_family, {
  add_whole_and_numerator: "FRA-12-R-ADD",
  multiply_by_numerator: "FRA-12-R-MULT-NUM",
  denominator_changed: "FRA-12-R-DENOM",
  dropped_fractional_part: "FRA-12-R-DROP",
  wrong_form: "FRA-12-R-FORM"
}, "all five error families route to their targeted repair");
for (const id of ["M1", "M2", "M3", "M4", "M5"]) {
  const question = spec.question_bank.find((item) => item.id === `FRA-12-${id}`);
  assert.equal(question.policy.hintPolicy, "none", `${id} has no pre-submit help`);
  assert.equal(question.policy.solutionPolicy, "after_locked_submit", `${id} reveals working only after answer lock`);
  assert.equal(question.policy.answerLocksOnSubmit, true, `${id} locks its response on submit`);
}

const allRuntimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const allRuntimeIds = new Set(Object.keys(runtime));
const bannedSpokenValues = [];
const authoredQuestions = [...owner.FRA12.questions, ...owner.FRA12.recoveryBank];
for (const question of authoredQuestions) {
  assert.ok(!allRuntimeTexts.has(question.prompt), `${question.id} prompt is not a Ryan utterance`);
  if (question.hint) assert.ok(!allRuntimeTexts.has(question.hint), `${question.id} hint is not a Ryan utterance`);
  Object.values(question.feedback || {}).flatMap((value) => Array.isArray(value) ? value : []).forEach((id) => {
    if (typeof id === "string" && id.includes(".")) assert.ok(allRuntimeIds.has(id), `${question.id} feedback ID ${id} exists`);
  });
}

for (const cue of owner.FRA12_SYNC_CUES) {
  assert.ok(allRuntimeIds.has(cue.utteranceId), `${cue.id} references an active utterance`);
  assert.ok(runtime[cue.utteranceId].text.includes(cue.anchorText), `${cue.id} anchor occurs in its exact utterance`);
}

function correctResponse(question) {
  const answer = question.answer.value;
  if (question.response.type === "fraction") {
    const [n, d] = String(answer).split("/");
    return { n, d };
  }
  if (question.response.type === "fra12_staged_fields") return { ...answer };
  return String(answer);
}

function wrongResponse(question) {
  const answer = correctResponse(question);
  if (question.response.type === "fraction") return { n: String(Number(answer.n) + 1), d: answer.d };
  if (question.response.type === "fra12_staged_fields") return { ...answer, wholePieceTotal: String(Number(answer.wholePieceTotal) + 1) };
  if (question.response.type === "integer") return String(Number(answer) + 1);
  return question.response.options.find((option) => option !== answer);
}

const scored = spec.question_bank.filter((question) => question.policy?.scored !== false);
for (const question of scored) {
  const correct = correctResponse(question);
  const wrong = wrongResponse(question);
  assert.equal(window.RevilyValidators.validate(question, correct), true, `${question.id} accepts its exact answer`);
  assert.equal(window.RevilyValidators.validate(question, wrong), false, `${question.id} rejects a wrong answer`);
  const correctIds = canonical.selectOutcomeUtteranceIds(question, correct, true);
  const wrongIds = canonical.selectOutcomeUtteranceIds(question, wrong, false);
  assert.ok(correctIds.length >= 1, `${question.id} has a correct outcome branch`);
  assert.ok(wrongIds.length >= 1, `${question.id} has an incorrect outcome branch`);
  assert.equal(correctIds.some((id) => wrongIds.includes(id)), false, `${question.id} correct and incorrect branches are disjoint`);
  correctIds.concat(wrongIds).forEach((id) => assert.ok(allRuntimeIds.has(id), `${question.id} outcome ${id} exists`));
}

const repairQuestions = spec.question_bank.filter((question) => question.stage === "repair");
assert.deepEqual(repairQuestions.map((question) => question.id), ["FRA-12-R-ADD", "FRA-12-R-MULT-NUM", "FRA-12-R-DENOM", "FRA-12-R-DROP", "FRA-12-R-FORM"], "all five targeted repairs are wired");
for (const question of repairQuestions) {
  const correct = correctResponse(question);
  const wrong = wrongResponse(question);
  assert.equal(window.RevilyValidators.validate(question, correct), true, `${question.id} accepts its supported response`);
  assert.equal(window.RevilyValidators.validate(question, wrong), false, `${question.id} rejects a wrong supported response`);
  const correctIds = canonical.selectOutcomeUtteranceIds(question, correct, true);
  const wrongIds = canonical.selectOutcomeUtteranceIds(question, wrong, false);
  assert.deepEqual(correctIds, question.runtimeOutcome.correctUtteranceIds, `${question.id} plays exactly its correct branch`);
  assert.deepEqual(wrongIds, question.runtimeOutcome.incorrectDefaultUtteranceIds, `${question.id} plays exactly its incorrect branch`);
  assert.equal(correctIds.some((id) => wrongIds.includes(id)), false, `${question.id} repair branches are disjoint`);
}

for (const question of spec.question_bank) {
  const spokenFields = [
    question.scripts?.before_submit,
    question.scripts?.on_correct_reaction,
    question.scripts?.on_incorrect_reaction,
    question.scripts?.on_incorrect_attempt_1,
    question.scripts?.on_incorrect_attempt_2,
    question.scripts?.worked_narration,
    question.scripts?.reteach
  ].flat(Infinity).filter(Boolean);
  spokenFields.forEach((text) => assert.ok(allRuntimeTexts.has(text), `${question.id} spoken script is exact registry text`));
  if (question.scripts?.worked_explanation) bannedSpokenValues.push(question.scripts.worked_explanation);
}
assert.ok(bannedSpokenValues.every((value) => !allRuntimeTexts.has(value)), "visible working is not promoted into Ryan speech");

const cleanEvidence = { firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false, freshConfirmationPassed: false };
assert.equal(owner.shouldSkipF1({ g1: cleanEvidence, g2: cleanEvidence, centralMisconceptionDetected: false }), true, "clean G1/G2 evidence skips only F1");
assert.equal(owner.shouldSkipF1({ g1: cleanEvidence, g2: { ...cleanEvidence, firstAttemptCorrect: false }, centralMisconceptionDetected: false }), false, "a weak G2 keeps F1");
assert.equal(owner.needsFreshNoHintConfirmation({ ...cleanEvidence, hintOpenedBeforeSubmit: true }), true, "hint success requires fresh no-hint confirmation");
assert.equal(owner.routeFRA12Final({ correctCount: 5, distinctFamiliesCorrect: 5, visualOrReasoningCorrect: true, repeatedBlockingMisconception: false }), "finish_candidate");
assert.equal(owner.routeFRA12Final({ correctCount: 3, distinctFamiliesCorrect: 3, visualOrReasoningCorrect: true, repeatedBlockingMisconception: false }), "targeted_repair_then_two_item_check");
assert.equal(owner.routeFRA12Final({ correctCount: 2, distinctFamiliesCorrect: 2, visualOrReasoningCorrect: true, repeatedBlockingMisconception: false }), "targeted_repair_then_fresh_five_item_final");

const primaryFive = [
  { rawId: "M1", family: "direct", correct: true, firstAttempt: true, errorFamily: null },
  { rawId: "M2", family: "visual", correct: true, firstAttempt: true, errorFamily: null },
  { rawId: "M3", family: "missing", correct: true, firstAttempt: true, errorFamily: null },
  { rawId: "M4", family: "method", correct: true, firstAttempt: true, errorFamily: null },
  { rawId: "M5", family: "reasoning", correct: false, firstAttempt: true, errorFamily: "add_whole_and_numerator" }
];
assert.equal(canonical.evaluateFinalEvidence(primaryFive, true).masterySatisfied, true, "qualifying four-of-five primary evidence finishes");
assert.equal(canonical.evaluateFinalEvidence(primaryFive.map((record, index) => index < 2 ? { ...record, correct: false, errorFamily: "add_whole_and_numerator" } : record), true).masterySatisfied, false, "repeated blocking evidence cannot finish");
assert.equal(canonical.selectFinalRoute(primaryFive).route, "primary_mastery", "qualifying four-of-five selects the finish route");
const threeOfFive = primaryFive.map((record, index) => ({ ...record, correct: index < 3, errorFamily: index < 3 ? null : (index === 3 ? "denominator_changed" : "wrong_form") }));
assert.deepEqual({ route: canonical.selectFinalRoute(threeOfFive).route, count: canonical.selectFinalRoute(threeOfFive).recoveryCount }, { route: "score_three_repair_then_two_of_two", count: 2 }, "three-of-five selects repair plus two-item mini-check");
const twoOfFive = primaryFive.map((record, index) => ({ ...record, correct: index < 2, errorFamily: index < 2 ? null : ["add_whole_and_numerator", "denominator_changed", "wrong_form"][index - 2] }));
assert.deepEqual({ route: canonical.selectFinalRoute(twoOfFive).route, count: canonical.selectFinalRoute(twoOfFive).recoveryCount }, { route: "score_zero_to_two_repair_then_fresh_five", count: 5 }, "zero-to-two-of-five selects repair plus fresh five-item final");
assert.equal(canonical.recoveryRoutePassed("score_three_repair_then_two_of_two", [{ correct: true, firstAttempt: true }, { correct: true, firstAttempt: true }]), true, "two first-attempt successes pass the mini-check");
assert.equal(canonical.recoveryRoutePassed("score_three_repair_then_two_of_two", [{ correct: true, firstAttempt: false }, { correct: true, firstAttempt: true }]), false, "a supported success does not pass the two-of-two mini-check");
const freshFive = [
  { rawId: "RF-DIRECT-A", family: "direct", correct: true, firstAttempt: true, errorFamily: null },
  { rawId: "RF-VISUAL-A", family: "visual", correct: true, firstAttempt: true, errorFamily: null },
  { rawId: "RF-METHOD-A", family: "method", correct: true, firstAttempt: true, errorFamily: null },
  { rawId: "RF-DENOM-A", family: "denominator", correct: true, firstAttempt: true, errorFamily: null },
  { rawId: "RF-REASON-A", family: "reasoning", correct: true, firstAttempt: true, errorFamily: null }
];
assert.equal(canonical.recoveryRoutePassed("score_zero_to_two_repair_then_fresh_five", freshFive), true, "a qualifying fresh five-item final passes");
assert.equal(canonical.recoveryRoutePassed("score_zero_to_two_repair_then_fresh_five", freshFive.map((record, index) => index < 2 ? { ...record, correct: false, errorFamily: "add_whole_and_numerator" } : record)), false, "a non-qualifying fresh five-item final remains needs-work");

const bank = owner.FRA12.recoveryBank;
const bankIds = new Set(bank.map((item) => `FRA-12-${item.id}`));
const bankFamilies = new Map(bank.map((item) => [`FRA-12-${item.id}`, item.assessmentFamily]));
for (let seed = 0; seed < 1000; seed += 1) {
  const params = {
    seed,
    count: 5,
    excludedIds: [seed % 2 ? "FRA-12-RF-DIRECT-A" : "FRA-12-RF-DIRECT-B"],
    excludedSignatures: [],
    requiredFamilies: ["direct", "visual", "method", "denominator", "reasoning"]
  };
  const first = canonical.selectRecoveryItems(params);
  const second = canonical.selectRecoveryItems(params);
  assert.deepEqual(first, second, `seed ${seed} is deterministic`);
  assert.equal(first.length, 5, `seed ${seed} returns five items`);
  assert.equal(new Set(first).size, 5, `seed ${seed} has no duplicate item`);
  assert.deepEqual(new Set(first.map((id) => bankFamilies.get(id))), new Set(params.requiredFamilies), `seed ${seed} covers every required family`);
  first.forEach((id) => assert.ok(bankIds.has(id), `seed ${seed} uses authored recovery item ${id}`));
  assert.ok(!first.includes(params.excludedIds[0]), `seed ${seed} excludes the seen ID`);
}

const directASignature = canonical.mixedSignature(bank.find((item) => item.id === "RF-DIRECT-A").mixedNumber);
const signatureExcluded = canonical.selectRecoveryItems({
  seed: 17,
  count: 2,
  excludedIds: [],
  excludedSignatures: [directASignature],
  requiredFamilies: ["direct", "visual"]
});
assert.ok(!signatureExcluded.includes("FRA-12-RF-DIRECT-A"), "number-signature freshness excludes the matching authored item");
assert.ok(signatureExcluded.includes("FRA-12-RF-DIRECT-B"), "the alternate direct item remains available");

console.log(`FRA12 tests passed: ${scored.length} scored questions, ${Object.keys(runtime).length} utterances, ${owner.FRA12_SYNC_CUES.length} cues, 1,000 deterministic recovery seeds.`);
