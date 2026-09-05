import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const fractionsDir = path.resolve(testsDir, "..");
const workspaceRoot = path.resolve(fractionsDir, "..");
const typescriptPath = path.join(workspaceRoot, "revily-site", "node_modules", "typescript", "lib", "typescript.js");
const typescriptModule = await import(pathToFileURL(typescriptPath));
const ts = typescriptModule.default || typescriptModule;

const canonicalPath = path.join(workspaceRoot, "FRA16_CANONICAL_SPEC.ts");
const canonicalSource = fs.readFileSync(canonicalPath, "utf8");
const compiled = ts.transpileModule(canonicalSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
  fileName: "FRA16_CANONICAL_SPEC.ts",
  reportDiagnostics: true
});
const compileErrors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.equal(compileErrors.length, 0, "FRA16 canonical TypeScript must compile without errors");
const sourceModule = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: sourceModule, exports: sourceModule.exports }, { filename: canonicalPath });
assert.equal(sourceModule.exports.validateFRA16CanonicalSpec().length, 0, "validateFRA16CanonicalSpec() must pass in the repository");
sourceModule.exports.assertFRA16CanonicalSpec();

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const localStorage = new MemoryStorage();
const documentObject = {
  hidden: false,
  body: { contains: () => false },
  addEventListener() {},
  removeEventListener() {}
};
const windowObject = {
  localStorage,
  location: { search: "" },
  crypto: { randomUUID: () => "fra16-test-attempt" },
  RevilyTopics: { all: [{ id: "fractions", title: "Fractions", storageNamespace: "fractions", skillIdPattern: "^FRA-" }] },
  setTimeout,
  clearTimeout,
  performance
};
windowObject.window = windowObject;
const context = vm.createContext({
  window: windowObject,
  localStorage,
  document: documentObject,
  URLSearchParams,
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
  console,
  performance,
  setTimeout,
  clearTimeout,
  structuredClone
});

function load(relativePath) {
  const filePath = path.join(fractionsDir, relativePath);
  new vm.Script(fs.readFileSync(filePath, "utf8"), { filename: filePath }).runInContext(context);
}

load("js/fra16-approved-spec.js");
load("js/fra16-canonical.js");
load("js/fra16-visuals.js");
load("js/validators.js");
load("js/lesson-model.js");
load("js/narration-sync.js");
windowObject.RevilyNarrationAssets = { voice: "en-GB-RyanNeural", voiceName: "Microsoft Ryan Online (Natural) - English (United Kingdom)", tracks: {} };
load("js/fra16-narration-assets.js");

const approved = windowObject.RevilyFra16V1.spec;
const generatedExports = context.RevilyFra16Approved;
const runtime = windowObject.FRA16_RUNTIME_COPY;
const canonical = windowObject.RevilyFra16Canonical;
assert.equal(JSON.stringify(approved), JSON.stringify(sourceModule.exports.FRA16), "generated FRA16 spec must match the authoritative TypeScript object");
assert.equal(Object.keys(runtime).length, 148, "all 148 approved FRA16 runtime utterances must be present");
assert.equal(generatedExports.validateFRA16CanonicalSpec().length, 0, "generated canonical validator must pass");
assert.equal(canonical.validateRuntimeContract().length, 0, "adapter runtime/caption/cue validation must pass");
assert.equal(JSON.stringify(Object.keys(runtime)), JSON.stringify(Object.keys(sourceModule.exports.FRA16_RUNTIME_COPY)), "generated and TypeScript runtime IDs must match");
for (const [id, entry] of Object.entries(runtime)) {
  assert.equal(entry.text, sourceModule.exports.FRA16_RUNTIME_COPY[id].text, `${id} text must match the authoritative TypeScript`);
  assert.equal(entry.captionSource, "same_as_audio", `${id} caption must resolve from the same utterance`);
  const track = windowObject.RevilyFra16NarrationAssets.tracksByUtteranceId[id];
  assert.equal(track.text, entry.text, `${id} audio/caption track must use exact runtime text`);
  assert.equal(track.provider, "Microsoft Edge Neural TTS", `${id} must inherit the shared Ryan provider`);
  assert.equal(track.voiceName, "Microsoft Ryan Online (Natural) - English (United Kingdom)", `${id} must inherit the approved Ryan voice`);
  assert.ok(track.words.length > 0, `${id} needs deterministic word timing`);
  assert.ok(track.words.every((word, index) => index === 0 || word.atMs >= track.words[index - 1].atMs), `${id} word timing must be monotonic`);
}

const baseSpec = {
  schema_version: "1.2",
  identity: { id: "FRA-16", title: "Compare and Order Fractions" },
  dependencies: { required_skill_refs: [] },
  diagnostic: {}, retrieval_practice: {}, lesson: {}, completion: {},
  voice_and_script: {}, visual_language: {}, engine_capability_requirements: {}, experience_contract: { global_ui_copy: {} }
};
const spec = canonical.apply(baseSpec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-16-${id}`);
assert.equal(spec.canonical_lesson.version, "fra16-runtime-v1");
assert.equal(spec.canonical_lesson.engine_profile, "fra16");
assert.equal(spec.identity.status, "OWNER_APPROVED_HANDOFF_V1_IMPLEMENTATION_CANDIDATE");
assert.equal(spec.voice_and_script.narration_playback.provider, "Microsoft Edge Neural TTS");
assert.equal(spec.voice_and_script.narration_playback.voice_id, "en-GB-RyanNeural");
assert.equal(spec.voice_and_script.narration_playback.mode, "browser_speech_ryan");
assert.deepEqual(Array.from(spec.lesson.teaching_steps, (step) => step.id), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "T5", "HANDOFF"]);
assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
assert.deepEqual([...spec.lesson.exit.primary_question_refs], ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-16-${id}`));
assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1", "both guided routes must retain F2");
assert.equal(spec.diagnostic.enabled, false, "FRA16 must not add a Diagnostic layer");
assert.equal(spec.retrieval_practice.enabled, false, "FRA16 must not add Retrieval");

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten) : typeof value === "string" && value ? [value] : [];
for (const scene of spec.lesson.teaching_steps) {
  for (const line of flatten(scene.narration?.script)) assert.ok(runtimeTexts.has(line), `${scene.id} narration escaped FRA16_RUNTIME_COPY`);
  for (const cue of scene.narration?.sync_cues || []) {
    assert.ok(runtime[cue.utteranceId], `${cue.id} points to a missing utterance`);
    assert.ok(runtime[cue.utteranceId].text.includes(cue.anchorText), `${cue.id} anchor must be an exact phrase in its utterance`);
  }
}
for (const item of spec.question_bank) {
  const spokenFields = [item.scripts?.before_submit, item.scripts?.on_correct_reaction, item.scripts?.on_incorrect_reaction, item.scripts?.on_incorrect_attempt_1, item.scripts?.on_incorrect_attempt_2, item.scripts?.worked_narration, item.scripts?.reteach];
  for (const line of spokenFields.flatMap(flatten)) assert.ok(runtimeTexts.has(line), `${item.id} contains non-authoritative Ryan speech: ${line}`);
  assert.equal(Object.prototype.hasOwnProperty.call(item, "captionText"), false, `${item.id} must not define a second caption string`);
  for (const cue of item.visual?.syncCues || []) {
    assert.ok(runtime[cue.utteranceId], `${item.id} cue points to missing ${cue.utteranceId}`);
    assert.ok(runtime[cue.utteranceId].text.includes(cue.anchorText), `${item.id} cue anchor is absent from ${cue.utteranceId}`);
  }
}
const cueOwner = approved.teachingScenes.find((scene) => scene.timeline.length)?.timeline[0];
const registryWithoutCueOwner = { ...runtime };
delete registryWithoutCueOwner[cueOwner.utteranceId];
assert.ok(canonical.validateRuntimeContract(registryWithoutCueOwner).some((issue) => issue.includes(cueOwner.utteranceId)), "removing speech must invalidate its caption/cue references");

function correctResponse(raw) {
  if (raw.answer.kind === "equivalent_comparison") return { rewrittenNumerators: [...raw.answer.rewrittenNumerators], symbol: raw.answer.symbol };
  if (raw.answer.kind === "benchmark_comparison") return { relations: [...raw.answer.relations], symbol: raw.answer.symbol };
  if (raw.answer.kind === "order") return [...raw.answer.orderedFractionIds];
  if (raw.answer.kind === "comparison") return raw.answer.symbol;
  if (raw.answer.kind === "choice") return raw.response.options.find((option) => option.id === raw.answer.optionId).label;
  throw new Error(`Unsupported answer kind ${raw.answer.kind}`);
}

function wrongResponse(raw) {
  if (raw.answer.kind === "equivalent_comparison") return { rewrittenNumerators: (raw.fractions || []).map((item) => String(item.value.numerator)), symbol: raw.answer.symbol };
  if (raw.answer.kind === "benchmark_comparison") return { relations: [...raw.answer.relations], symbol: ["<", ">", "="].find((value) => value !== raw.answer.symbol) };
  if (raw.answer.kind === "order") return [...raw.answer.orderedFractionIds].reverse();
  if (raw.answer.kind === "comparison") return ["<", ">", "="].find((value) => value !== raw.answer.symbol);
  if (raw.answer.kind === "choice") return raw.response.options.find((option) => option.id !== raw.answer.optionId).label;
  throw new Error(`Unsupported answer kind ${raw.answer.kind}`);
}

const validators = windowObject.RevilyValidators;
for (const raw of generatedExports.getAllQuestionLikeSpecs()) {
  const converted = question(raw.id);
  const right = correctResponse(raw);
  const wrong = wrongResponse(raw);
  assert.equal(validators.validate(converted, right), true, `${raw.id} canonical response was rejected`);
  assert.equal(validators.validate(converted, wrong), false, `${raw.id} deliberate wrong response was accepted`);
  assert.deepEqual([...canonical.selectOutcomeUtteranceIds(converted, right, true)], [...raw.feedback.correctUtteranceIds], `${raw.id} correct branch changed`);
  const observed = canonical.observedResponseKey(converted, wrong);
  const expectedWrong = raw.feedback.incorrectByObservedResponse?.[observed] || raw.feedback.incorrectDefaultUtteranceIds;
  const actualWrong = canonical.selectOutcomeUtteranceIds(converted, wrong, false);
  assert.deepEqual([...actualWrong], [...expectedWrong], `${raw.id} must select exactly the matching incorrect branch`);
  assert.ok(!actualWrong.some((id) => raw.feedback.correctUtteranceIds.includes(id)), `${raw.id} wrong response must never play its correct line`);
}

const hookScene = approved.teachingScenes.find((scene) => scene.id === "HOOK");
const hookQuestion = question("HOOK-CHOICE");
assert.equal(hookQuestion.policy.scored, false);
assert.equal(hookQuestion.policy.engagementOnly, true);
const hookSequences = hookScene.interaction.options.map((option) => {
  const label = option.label;
  const ids = hookQuestion.runtimeOutcome.responseUtteranceIdsByValue[label];
  assert.deepEqual([...ids], [...generatedExports.getHookResponseSequence(option.id)], `hook ${option.id} feedback changed`);
  return ids.join("|");
});
assert.equal(new Set(hookSequences).size, 4, "Blue, Orange, Same and Not sure must receive distinct feedback before convergence");

for (const id of ["F1", "F2", "I1", "I2"]) {
  assert.equal(question(id).policy.hintPolicy, "optional", `${id} hint must begin collapsed and optional`);
  assert.equal(question(id).policy.requiresFreshNoHintConfirmationIfHintUsed, true, `${id} supported success must require fresh no-hint evidence`);
  assert.ok(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question[`FRA-16-${id}`], `${id} needs an authored confirmation route`);
}
assert.equal(question("F2").response.allowDrag, true, "F2 ordering must support pointer drag");
assert.equal(question("F2").response.allowKeyboardReorder, true, "F2 ordering must support keyboard movement");
assert.equal(question("F2").response.allowMoveButtons, true, "F2 ordering must expose touch/screen-reader move buttons");
for (const id of ["M1", "M2", "M3", "M4", "M5", "RF1", "RF2", "RF3", "RF-EQ", "RF-B"]) {
  assert.equal(question(id).policy.hintPolicy, "none", `${id} must be unsupported before submit`);
  assert.equal(question(id).policy.answerLocksOnSubmit, true, `${id} must lock on submit`);
  assert.equal(question(id).policy.solutionPolicy, "after_locked_submit", `${id} working must appear only after lock`);
}
for (const [family, repairId] of Object.entries({ numerator_only: "R-NUM", denominator_only: "R-DEN", inconsistent_equivalence: "R-EQUIV", equality_rejected: "R-EQUIV", symbol_or_order_direction: "R-SYMBOL" })) {
  const repair = question(repairId);
  assert.equal(spec.lesson.adaptive_pathway.repair_by_error_family[family], `FRA-16-${repairId}`, `${family} must use its canonical repair`);
  assert.ok(repair.supportedQuestionId, `${repairId} must have supported practice`);
  assert.ok(repair.freshCheckId, `${repairId} must have a fresh recheck`);
}
assert.deepEqual([...question("R-EQUIV").equalityExtensionUtteranceIds], ["R-EQUIV.EQUALITY"], "equality repair extension must remain canonical");

assert.equal(generatedExports.compareFractions({ numerator: 5, denominator: 8 }, { numerator: 2, denominator: 3 }), "<");
assert.equal(generatedExports.equivalentNumerator({ numerator: 5, denominator: 8 }, 24), 15);
assert.equal(generatedExports.equivalentNumerator({ numerator: 2, denominator: 3 }, 24), 16);
assert.deepEqual([...generatedExports.orderFractionIds([
  { id: "a", value: { numerator: 7, denominator: 12 } },
  { id: "b", value: { numerator: 5, denominator: 8 } },
  { id: "c", value: { numerator: 3, denominator: 4 } }
])], ["a", "b", "c"]);
assert.equal(generatedExports.routeAfterGuided({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: true, supportEscalated: false, unresolvedCentralMisconception: false }), "fast_skip_f1_keep_f2");
assert.equal(generatedExports.routeAfterGuided({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: false, supportEscalated: false, unresolvedCentralMisconception: false }), "standard_f1_then_f2");
assert.equal(generatedExports.routeFinalCheck({ correctCount: 4, hasProceduralEvidence: true, hasReasoningOrApplicationEvidence: true, repeatedBlockingMisconception: false }), "finish_candidate");
assert.equal(generatedExports.routeFinalCheck({ correctCount: 3, hasProceduralEvidence: true, hasReasoningOrApplicationEvidence: true, repeatedBlockingMisconception: false }), "targeted_repair_then_fresh_two_item_check");
assert.equal(generatedExports.routeFinalCheck({ correctCount: 2, hasProceduralEvidence: true, hasReasoningOrApplicationEvidence: true, repeatedBlockingMisconception: false }), "targeted_repair_then_fresh_three_item_final");

const visuals = windowObject.RevilyFra16Visuals;
const sceneMarkup = (id) => {
  const scene = spec.lesson.teaching_steps.find((step) => step.id === id);
  return visuals.renderMarkup({ model: scene.scene.model }, { feedback: "initial" });
};
const hookMarkup = sceneMarkup("HOOK");
assert.match(hookMarkup, /--fra16-parts:8/);
assert.match(hookMarkup, /5 of 8 stages/);
assert.match(hookMarkup, /--fra16-parts:3/);
assert.match(hookMarkup, /2 of 3 stages/);
assert.match(sceneMarkup("T2"), /aria-label="15 over 24"/);
assert.match(sceneMarkup("T2"), /aria-label="16 over 24"/);
assert.match(sceneMarkup("T3"), /fra16-half-label/);
assert.match(sceneMarkup("T4"), /14\/24/);
assert.match(sceneMarkup("T4"), /18\/24/);
assert.match(sceneMarkup("T5"), /28\/24|aria-label="28 over 24"/);
assert.match(sceneMarkup("T5"), /27\/24|aria-label="27 over 24"/);
assert.doesNotMatch(sceneMarkup("T5"), /improper|mixed number|convert/i, "7/6 and 9/8 must not be classified or converted");
const m1Initial = visuals.renderMarkup(question("M1").visual, { question: question("M1"), feedback: "initial" });
assert.doesNotMatch(m1Initial, /fra16-worked/, "final working must not exist before the answer locks");
for (const step of question("M1").canonicalQuestion.workedCheck.visibleSteps) assert.ok(!m1Initial.includes(step), "final working leaked before lock");
const m1Worked = visuals.renderMarkup(question("M1").visual, { question: question("M1"), feedback: "worked" });
assert.match(m1Worked, /fra16-worked/, "final working must render after lock");
const css = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*\.fra16-game-row/, "FRA16 needs an authored narrow-screen layout");
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.fra16-context-visual/, "FRA16 must honor reduced motion");

const model = windowObject.RevilyLessonModel.buildLessonModel(spec);
assert.equal(model.firstId, "HOOK");
assert.equal(model.nodes.length, 19);
assert.equal(model.getNode("G2").nextId, "F1");
assert.equal(model.getNode("F2").nextId, "I1");
assert.equal(model.exitIds.length, 5);

windowObject.RevilyVisuals = { escapeHtml: String, mathMarkup: String, render() {} };
windowObject.RevilyNarrationSync = { NarrationSync: class NarrationSync { stop() {} } };
load("js/lesson-engine.js");
const LessonEngine = windowObject.RevilyLessonEngine.LessonEngine;
const topic = { id: "fractions", title: "Fractions", storageNamespace: "fractions" };
const storageKey = "revily.fractions.FRA-16.current.v1";
localStorage.setItem(storageKey, JSON.stringify({ version: 1, contentVersion: "legacy-fra16-yaml", topicId: "fractions", skillId: "FRA-16", attemptId: "old-attempt", status: "SECURE", cursor: "T08", drafts: { old: "stale" }, submissions: { old: [{ response: "stale" }] }, exit: { result: "SECURE" }, soundOn: false, developerOpen: true }));
const migrated = new LessonEngine({}, spec, {}, { topic });
assert.equal(migrated.state.cursor, "HOOK");
assert.equal(migrated.state.soundOn, false);
assert.equal(migrated.state.developerOpen, true);
assert.deepEqual({ ...migrated.state.drafts }, {});
assert.equal(migrated.state.contentMigration.to, "fra16-runtime-v1");
assert.equal(JSON.parse(localStorage.getItem("revily.fractions.FRA-16.history.v1")).at(-1).completionResult, "SECURE", "old FRA16 completion must be archived during migration");

const resumable = migrated.freshState();
resumable.started = true;
resumable.cursor = "FRESH:FRA-16-C-SORT";
resumable.drafts["FRA-16-C-SORT"] = ["card-c", "card-a", "card-b"];
resumable.evidence.hintOpened["FRA-16-I2"] = true;
resumable.evidence.pendingNoHintConfirmations = ["FRA-16-C-SORT"];
resumable.narrationResume = { active: true, utteranceIds: ["I2.INTRO.1"], utteranceIndex: 0, elapsedMs: 840, completedCueIds: ["I2.CUE.1"], action: "continue" };
resumable.pendingRecovery = { recoveryId: "FRA-16-R-SYMBOL", family: "symbol_or_order_direction", fra16RepairFlow: true };
localStorage.setItem(storageKey, JSON.stringify(resumable));
const resumed = new LessonEngine({}, spec, {}, { topic });
assert.equal(resumed.state.cursor, "FRESH:FRA-16-C-SORT");
assert.deepEqual([...resumed.state.drafts["FRA-16-C-SORT"]], ["card-c", "card-a", "card-b"]);
assert.equal(resumed.state.evidence.hintOpened["FRA-16-I2"], true);
assert.deepEqual([...resumed.state.evidence.pendingNoHintConfirmations], ["FRA-16-C-SORT"]);
assert.equal(resumed.state.narrationResume.utteranceIds[0], "I2.INTRO.1");
assert.deepEqual([...resumed.state.narrationResume.completedCueIds], ["I2.CUE.1"]);
assert.equal(resumed.state.pendingRecovery.recoveryId, "FRA-16-R-SYMBOL");

const routeHarness = Object.create(LessonEngine.prototype);
routeHarness.spec = spec;
routeHarness.model = model;
routeHarness.emit = () => {};
routeHarness.state = migrated.freshState();
routeHarness.state.evidence.firstAttemptCorrect["FRA-16-G1"] = true;
routeHarness.state.evidence.firstAttemptCorrect["FRA-16-G2"] = true;
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F2", "strong guided route must skip F1 and retain F2");
routeHarness.state.evidence.supportEscalated["FRA-16-G2"] = true;
assert.equal(routeHarness.adaptiveNextId(model.getNode("G2")), "F1", "supported guided evidence must keep F1");
routeHarness.state.evidence.pendingNoHintConfirmations = ["FRA-16-C-SORT"];
assert.equal(routeHarness.adaptiveNextId(model.getNode("I2")), "FRESH:FRA-16-C-SORT", "hint-supported success must route to fresh no-hint confirmation");
routeHarness.state.cursor = "RECOVERY:FRA-16-R-EQUIV";
routeHarness.state.pendingRecovery = { recoveryId: "FRA-16-R-EQUIV", family: "equality_rejected" };
const equalityRepairNarration = routeHarness.narrationLinesFor(routeHarness.current());
assert.ok(equalityRepairNarration.includes(runtime["R-EQUIV.EQUALITY"].text), "equality rejection must play the approved R-EQUIV equality extension");

function finalHarness(correctIds, families = {}) {
  const harness = Object.create(LessonEngine.prototype);
  harness.spec = spec;
  harness.model = model;
  harness.emit = () => {};
  harness.persist = () => {};
  harness.state = migrated.freshState();
  model.exitIds.forEach((id) => {
    const correct = correctIds.has(id);
    harness.state.exit.responses[id] = { response: "test", correct };
    harness.state.evidence.firstAttemptCorrect[id] = correct;
    if (!correct && families[id]) harness.state.evidence.candidateErrorFamily[id] = families[id];
  });
  return harness;
}

const fourHarness = finalHarness(new Set(["FRA-16-M1", "FRA-16-M2", "FRA-16-M3", "FRA-16-M4"]), { "FRA-16-M5": "denominator_only" });
fourHarness.routeFra16FinalEvidence(4, ["FRA-16-M5"]);
assert.equal(fourHarness.state.exit.result, "SECURE", "4/5 with evidence breadth and no repeated blocker must finish");

const repeatedHarness = finalHarness(new Set(["FRA-16-M1", "FRA-16-M2", "FRA-16-M3", "FRA-16-M4"]), { "FRA-16-M5": "denominator_only" });
repeatedHarness.state.evidence.errorFamily["FRA-16-I1"] = "denominator_only";
repeatedHarness.state.evidence.errorFamily["FRA-16-M5"] = "denominator_only";
repeatedHarness.routeFra16FinalEvidence(4, ["FRA-16-M5"]);
assert.equal(repeatedHarness.state.exit.remediation.requiredSuccesses, 3, "a repeated blocker must prevent direct finish and require the canonical fresh final");
assert.match(repeatedHarness.state.cursor, /^RECOVERY:FRA-16-R-/);

const threeHarness = finalHarness(new Set(["FRA-16-M1", "FRA-16-M2", "FRA-16-M3"]), { "FRA-16-M4": "denominator_only", "FRA-16-M5": "denominator_only" });
threeHarness.routeFra16FinalEvidence(3, ["FRA-16-M4", "FRA-16-M5"]);
assert.equal(threeHarness.state.exit.remediation.route, "targeted_repair_then_fresh_two_item_check");
assert.equal(threeHarness.state.exit.remediation.requiredSuccesses, 2);
assert.equal(threeHarness.state.exit.remediation.recoveryIds.length, 2);
assert.match(threeHarness.state.cursor, /^RECOVERY:FRA-16-R-/);

const twoHarness = finalHarness(new Set(["FRA-16-M1", "FRA-16-M3"]), { "FRA-16-M2": "equality_rejected", "FRA-16-M4": "denominator_only", "FRA-16-M5": "denominator_only" });
twoHarness.routeFra16FinalEvidence(2, ["FRA-16-M2", "FRA-16-M4", "FRA-16-M5"]);
assert.equal(twoHarness.state.exit.remediation.route, "targeted_repair_then_fresh_three_item_final");
assert.equal(twoHarness.state.exit.remediation.requiredSuccesses, 3);
assert.equal(twoHarness.state.exit.remediation.recoveryIds.length, 3);
assert.match(twoHarness.state.cursor, /^RECOVERY:FRA-16-R-/);

function makeFlowHarness() {
  const harness = Object.create(LessonEngine.prototype);
  harness.spec = spec;
  harness.model = model;
  harness.state = migrated.freshState();
  harness.emit = () => {};
  harness.persist = () => {};
  harness.render = () => {};
  harness.stopNarration = () => {};
  harness.finishExit = () => { harness.state.cursor = "COMPLETE"; };
  return harness;
}

const repairFlow = makeFlowHarness();
repairFlow.state.pendingRecovery = {
  originId: "I1", originQuestionId: "FRA-16-I1", recoveryId: "FRA-16-R-NUM",
  supportedId: "FRA-16-RN-S", freshId: "FRA-16-RN-C", returnId: "I2",
  family: "numerator_only", fra16RepairFlow: true, exitRemediation: false
};
repairFlow.state.cursor = "RECOVERY:FRA-16-R-NUM";
repairFlow.finishRecovery();
assert.equal(repairFlow.state.cursor, "FRESH:FRA-16-RN-S", "R-NUM must continue to its supported practice");
repairFlow.state.freshContext.correct = true;
repairFlow.advanceFresh({ questionId: "FRA-16-RN-S" });
assert.equal(repairFlow.state.cursor, "FRESH:FRA-16-RN-C", "supported R-NUM success must continue to a fresh recheck");
repairFlow.state.freshContext.correct = true;
repairFlow.advanceFresh({ questionId: "FRA-16-RN-C" });
assert.equal(repairFlow.state.cursor, "I2", "fresh R-NUM success must return to the authored route");
assert.equal(repairFlow.state.evidence.freshConfirmationPassed["FRA-16-RN-C"], true, "repair-supported evidence did not certify itself without a fresh success");

const miniCheck = makeFlowHarness();
miniCheck.state.exit.remediation = { profile: "fra16", requiredSuccesses: 2, results: [] };
miniCheck.beginFra16RecoveryItems(["FRA-16-RF1", "FRA-16-RF3"]);
assert.equal(miniCheck.state.cursor, "FRESH:FRA-16-RF1", "3/5 mini-check must begin with a fresh recovery item");
miniCheck.state.exit.responses["FRA-16-RF1"] = { response: "test", correct: true };
miniCheck.state.freshContext.correct = true;
miniCheck.advanceFresh({ questionId: "FRA-16-RF1" });
assert.equal(miniCheck.state.cursor, "FRESH:FRA-16-RF3", "3/5 mini-check did not reach its second fresh item");
miniCheck.state.exit.responses["FRA-16-RF3"] = { response: "test", correct: true };
miniCheck.state.freshContext.correct = true;
miniCheck.advanceFresh({ questionId: "FRA-16-RF3" });
assert.equal(miniCheck.state.exit.result, "SECURE", "fresh 2/2 mini-check must finish securely");
assert.equal(miniCheck.state.cursor, "COMPLETE");

const freshFinal = makeFlowHarness();
freshFinal.state.exit.remediation = { profile: "fra16", requiredSuccesses: 3, results: [] };
freshFinal.beginFra16RecoveryItems(["FRA-16-RF1", "FRA-16-RF3", "FRA-16-RF-B"]);
for (const [index, id] of ["FRA-16-RF1", "FRA-16-RF3", "FRA-16-RF-B"].entries()) {
  const correct = index !== 1;
  freshFinal.state.exit.responses[id] = { response: "test", correct };
  freshFinal.state.freshContext.correct = correct;
  freshFinal.advanceFresh({ questionId: id });
}
assert.equal(freshFinal.state.exit.result, "NEEDS_WORK", "fresh 3-item final must require 3/3");
assert.equal(freshFinal.state.cursor, "COMPLETE");

for (const relativePath of [
  "js/fra16-approved-spec.js", "js/fra16-canonical.js", "js/fra16-visuals.js", "js/fra16-narration-assets.js",
  "tests/fra16-v1-tests.mjs", "tests/fra16-mobile-qa.html"
]) {
  assert.equal(
    fs.readFileSync(path.join(fractionsDir, relativePath), "utf8"),
    fs.readFileSync(path.join(workspaceRoot, "revily-site", "public", "fractions", relativePath), "utf8"),
    `${relativePath} FRA16 hosted mirror is stale`
  );
}

console.log(`FRA16 source validator, ${Object.keys(runtime).length} utterances, ${generatedExports.getAllQuestionLikeSpecs().length} authored question-like specs, runtime/caption/cue parity, mathematics, visuals, migration/resume, guided/hint/repair and final/recovery routes: PASS`);
