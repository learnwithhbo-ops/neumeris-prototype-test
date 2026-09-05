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

const canonicalPath = path.join(workspaceRoot, ".codex-fra20-handoff", "FRA20_CANONICAL_SPEC.ts");
const canonicalSource = fs.readFileSync(canonicalPath, "utf8");
const compiled = ts.transpileModule(canonicalSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
  fileName: "FRA20_CANONICAL_SPEC.ts",
  reportDiagnostics: true
});
const compileErrors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.equal(compileErrors.length, 0, "FRA20 canonical TypeScript must compile without errors");
const sourceModule = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: sourceModule, exports: sourceModule.exports }, { filename: canonicalPath });
assert.equal(sourceModule.exports.validateFRA20CanonicalSpec().length, 0, "validateFRA20CanonicalSpec() must pass in the repository");
sourceModule.exports.assertFRA20CanonicalSpec();

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
  removeEventListener() {},
  createElement() { return { set src(_value) {}, preload: "", pause() {}, load() {} }; }
};
const windowObject = {
  localStorage,
  location: { search: "" },
  crypto: { randomUUID: () => "fra20-test-attempt" },
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

load("js/fra20-approved-spec.js");
load("js/fra20-canonical.js");
load("js/fra20-visuals.js");
load("js/validators.js");
load("js/lesson-model.js");
load("js/narration-sync.js");
windowObject.RevilyVisuals = { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render() {} };
windowObject.RevilyNarrationAssets = { voice: "en-GB-RyanNeural", voiceName: "Microsoft Ryan Online (Natural) - English (United Kingdom)", tracks: {} };

const generated = windowObject.RevilyFra20Approved;
const runtime = windowObject.FRA20_RUNTIME_COPY;
const canonical = windowObject.RevilyFra20Canonical;
assert.equal(Object.keys(runtime).length, 53, "all 53 approved FRA20 runtime utterances must be present");
assert.equal(generated.timelineCues.length, 48, "all 48 owner-approved cue bindings must be present");
assert.equal(generated.allQuestions.length, 51, "the 28 core/confirmation/repair questions and 23 recovery items must be present");
assert.equal(canonical.validateRuntimeContract().length, 0, "runtime/caption/cue validation must pass");
assert.deepEqual(Object.keys(runtime), Object.keys(sourceModule.exports.FRA20_RUNTIME_COPY), "generated and TypeScript runtime IDs must match");
for (const [id, entry] of Object.entries(runtime)) {
  assert.equal(entry.text, sourceModule.exports.FRA20_RUNTIME_COPY[id].text, `${id} text must match the authoritative TypeScript`);
  assert.equal(entry.captionSource, "same_as_audio", `${id} caption must resolve from the same utterance`);
}
for (const cue of generated.timelineCues) {
  assert.ok(runtime[cue.utteranceId], `${cue.id} points to a missing utterance`);
  assert.ok(runtime[cue.utteranceId].text.includes(cue.anchorText), `${cue.id} anchor must be an exact phrase in its utterance`);
}

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten) : typeof value === "string" && value ? [value] : [];
const questions = canonical.buildQuestions();
for (const item of questions) {
  const spokenFields = [item.scripts?.before_submit, item.scripts?.on_correct_reaction, item.scripts?.on_incorrect_reaction, item.scripts?.on_incorrect_attempt_1, item.scripts?.on_incorrect_attempt_2, item.scripts?.reteach, item.scripts?.engagement_response_by_value];
  for (const line of spokenFields.flatMap(flatten)) assert.ok(runtimeTexts.has(line), `${item.id} contains non-authoritative Ryan speech: ${line}`);
  assert.equal(Object.prototype.hasOwnProperty.call(item, "captionText"), false, `${item.id} must not define a second caption string`);
  for (const cue of item.visual?.syncCues || []) {
    assert.ok(runtime[cue.utteranceId], `${item.id} cue points to missing ${cue.utteranceId}`);
    assert.ok(runtime[cue.utteranceId].text.includes(cue.anchorText), `${item.id} cue anchor is absent from ${cue.utteranceId}`);
  }
}

for (let seed = 0; seed < 1000; seed += 1) {
  const ids = canonical.selectRecoveryItems({
    seed,
    count: 4,
    requiredFamilies: ["DIRECT", "CONTEXT", "ERROR_REASON"],
    seenKeys: ["RF-D1|DIRECT|symbolic|14-5/19|recovery"]
  });
  assert.equal(ids.length, 4, `seed ${seed} must return four items`);
  assert.equal(new Set(ids).size, 4, `seed ${seed} must not repeat an item`);
  const families = new Set(ids.map((id) => generated.recoveryItems.find((item) => item.id === id).family));
  for (const family of ["DIRECT", "CONTEXT", "ERROR_REASON"]) assert.ok(families.has(family), `seed ${seed} missed ${family}`);
}

const baseSpec = {
  schema_version: "1.2",
  identity: { id: "FRA-20", title: "Legacy FRA20" },
  dependencies: { required_skill_refs: [] },
  diagnostic: {}, retrieval_practice: {}, lesson: {}, completion: {},
  voice_and_script: {}, visual_language: {}, engine_capability_requirements: {}, experience_contract: { global_ui_copy: {} }
};
const spec = canonical.apply(baseSpec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-20-${id}`);
assert.equal(spec.canonical_lesson.version, "fra20-handoff-v1-runtime-1");
assert.equal(spec.canonical_lesson.engine_profile, "fra20");
assert.deepEqual(Array.from(spec.lesson.teaching_steps, (step) => step.id), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "HANDOFF"]);
assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
assert.deepEqual([...spec.lesson.exit.primary_question_refs], ["M1", "M2", "M3", "M4"].map((id) => `FRA-20-${id}`));
assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1", "both guided routes must retain F2");
assert.equal(spec.diagnostic.enabled, false, "FRA20 must not add Diagnostic");
assert.equal(spec.retrieval_practice.enabled, false, "FRA20 must not add Retrieval");
assert.deepEqual([...spec.completion.secure.buttons], ["Back to Fractions", "Start again"], "completion must not hard-code FRA21");

assert.equal(canonical.evaluateResponse(question("G1"), "5").correct, true, "G1 locked denominator must accept 5/9");
assert.equal(canonical.evaluateResponse(question("G2"), { n: "13", d: "14" }).errorFamily, "ADD");
assert.equal(canonical.evaluateResponse(question("G2"), { n: "4", d: "14" }).errorFamily, "COPY");
assert.equal(canonical.evaluateResponse(question("G2"), { n: "5", d: "0" }).errorFamily, "DEN_CHANGE");
const wrongForm = canonical.evaluateResponse(question("G2"), { n: "10", d: "28" });
assert.equal(wrongForm.mathematicallyCorrect, true);
assert.equal(wrongForm.correct, false);
assert.equal(wrongForm.errorFamily, "RENAME");
const valueAllowed = canonical.evaluateResponse(question("I1"), { n: "14", d: "26" });
assert.equal(valueAllowed.correct, true, "I1 must accept an exact equivalent value");
assert.equal(valueAllowed.formCorrect, false, "I1 must record the form deviation separately");
assert.equal(canonical.evaluateResponse(question("M3"), "11").correct, true);
assert.equal(canonical.evaluateResponse(question("M4"), question("M4").canonicalQuestion.options[2].text).errorFamily, "DEN_CHANGE");

const hook = question("HOOK");
assert.equal(hook.policy.engagementOnly, true);
assert.deepEqual([...hook.scripts.engagement_response_by_value.No], [runtime["H-F-C01"].text, runtime["H-U04"].text]);
assert.deepEqual([...hook.scripts.engagement_response_by_value.Yes], [runtime["H-F-W01"].text, runtime["H-U04"].text]);
assert.notEqual(hook.scripts.engagement_response_by_value.No[0], hook.scripts.engagement_response_by_value.Yes[0], "hook outcomes must remain distinct before convergence");

for (const id of ["F1", "F2", "I1", "I2"]) {
  const item = question(id);
  assert.equal(item.policy.hintPolicy, "optional");
  assert.equal(item.policy.requiresFreshNoHintConfirmationIfHintUsed, true);
  assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question[item.id], `FRA-20-${generated.lesson.route.hintConfirmationMap[id]}`);
}
for (const id of ["M1", "M2", "M3", "M4"]) {
  const item = question(id);
  assert.equal(item.policy.hintPolicy, "none");
  assert.equal(item.policy.answerLocksOnSubmit, true);
  assert.equal(item.policy.solutionPolicy, "after_locked_submit");
  assert.ok(item.scripts.worked_explanation.length > 0);
}
assert.equal(windowObject.RevilyFra20Visuals.renderMarkup(question("M1").visual, { question: question("M1"), feedback: "initial" }).includes("7/18"), false, "M1 must not reveal its result before lock");
assert.ok(windowObject.RevilyFra20Visuals.renderMarkup(question("M1").visual, { question: question("M1"), feedback: "worked" }).includes("Working shown after the answer was locked"), "M1 must reveal sequential working after lock");
const m3InitialVisual = windowObject.RevilyFra20Visuals.renderMarkup(question("M3").visual, { question: question("M3"), feedback: "initial" });
assert.doesNotMatch(m3InitialVisual, /START 11/, "M3 must not reveal the missing starting numerator before submission");
assert.match(m3InitialVisual, /START \?/, "M3 needs a visible unknown-state equivalent");
assert.match(windowObject.RevilyFra20Visuals.renderMarkup(question("M3").visual, { question: question("M3"), feedback: "worked" }), /START 11/, "M3 may reveal the starting numerator after answer lock");
for (const item of spec.question_bank) {
  for (const feedback of ["initial", "support"]) {
    const markup = windowObject.RevilyFra20Visuals.renderMarkup(item.visual, { question: item, feedback });
    assert.ok(markup, `${item.id} ${feedback} visual must render`);
    assert.doesNotMatch(markup, /undefined|NaN/, `${item.id} ${feedback} visual contains an unresolved value`);
  }
  assert.ok(windowObject.RevilyFra20Visuals.accessibleDescription(item.model, { feedback: "initial" }).trim(), `${item.id} needs a non-empty accessible visual description`);
}
const rAddVisual = windowObject.RevilyFra20Visuals.renderMarkup(question("R-ADD").visual, { question: question("R-ADD"), feedback: "initial" });
assert.match(rAddVisual, /Count back 4 from 9/);
assert.match(rAddVisual, /sixteenths stay sixteenths/, "addition repair must retain its approved denominator 16");
const rOrderVisual = windowObject.RevilyFra20Visuals.renderMarkup(question("R-ORDER").visual, { question: question("R-ORDER"), feedback: "initial" });
assert.match(rOrderVisual, /<b>11<\/b>/);
assert.match(rOrderVisual, /<b>14<\/b>/, "order repair must retain its approved 11/14 and 6/14 values");
const fra20Css = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
assert.match(fra20Css, /@media \(max-width: 620px\)[\s\S]*?\.fra20-tank-scene/, "FRA20 needs a narrow-screen layout");
assert.match(fra20Css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.fra20-working li/, "FRA20 needs a reduced-motion equivalent");
for (const relativePath of ["js/fra20-approved-spec.js", "js/fra20-canonical.js", "js/fra20-visuals.js", "tests/fra20-v1-tests.mjs"]) {
  const source = fs.readFileSync(path.join(fractionsDir, relativePath));
  const mirror = fs.readFileSync(path.join(workspaceRoot, "revily-site", "public", "fractions", relativePath));
  assert.equal(Buffer.compare(source, mirror), 0, `${relativePath} must match the hosted mirror`);
}
for (const root of [fractionsDir, path.join(workspaceRoot, "revily-site", "public", "fractions")]) {
  const page = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const engine = fs.readFileSync(path.join(root, "js", "lesson-engine.js"), "utf8");
  assert.match(page, /fra20-approved-spec\.js/);
  assert.match(page, /fra20-canonical\.js/);
  assert.match(page, /fra20-visuals\.js/);
  assert.match(engine, /\["fra17", "fra20"\]\.includes\(question\.model\?\.context\)/, "FRA20 model choices need accessible names in source and hosted runtimes");
  assert.match(engine, /this\.isFra20V1\(\) && this\.state\.cursor\.startsWith\("FRESH:"\)/, "FRA20 final Continue must render its fresh recovery route");
}

const primaryRecords = ["M1", "M2", "M3", "M4"].map((id) => ({ questionId: `FRA-20-${id}`, family: question(id).evidenceFamily, firstAttemptCorrect: true, countsAsIndependentEvidence: true }));
assert.equal(canonical.routeFinal(primaryRecords, false), "finish_candidate");
assert.equal(canonical.routeFinal(primaryRecords.map((record) => ({ ...record, firstAttemptCorrect: record.questionId !== "FRA-20-M1" })), false), "fresh_direct_confirmation");
assert.equal(canonical.routeFinal(primaryRecords.map((record, index) => ({ ...record, firstAttemptCorrect: index < 2 })), false), "targeted_repair_then_two_item_check");
assert.equal(canonical.routeFinal(primaryRecords.map((record, index) => ({ ...record, firstAttemptCorrect: index === 0 })), false), "targeted_repair_then_fresh_four_item_final");

load("js/lesson-engine.js");
const LessonEngine = windowObject.RevilyLessonEngine.LessonEngine;
const topic = { id: "fractions", title: "Fractions", storageNamespace: "fractions" };
const storageKey = "revily.fractions.FRA-20.current.v1";
localStorage.setItem(storageKey, JSON.stringify({ version: 1, contentVersion: "legacy-fra20-yaml", topicId: "fractions", skillId: "FRA-20", attemptId: "old-attempt", status: "SECURE", cursor: "T06", drafts: { old: "stale" }, submissions: { old: [{ response: "stale" }] }, exit: { result: "SECURE" }, soundOn: false, developerOpen: true }));
const migrated = new LessonEngine({}, spec, {}, { topic });
assert.equal(migrated.state.cursor, "HOOK");
assert.equal(migrated.state.soundOn, false);
assert.equal(migrated.state.developerOpen, true);
assert.deepEqual({ ...migrated.state.drafts }, {});
assert.equal(migrated.state.contentMigration.to, "fra20-handoff-v1-runtime-1");
assert.equal(JSON.parse(localStorage.getItem("revily.fractions.FRA-20.history.v1")).at(-1).completionResult, "SECURE");

const accessibleChoiceHarness = Object.create(LessonEngine.prototype);
accessibleChoiceHarness.spec = spec;
accessibleChoiceHarness.state = migrated.freshState();
accessibleChoiceHarness.choiceOptions = LessonEngine.prototype.choiceOptions;
const i2ChoiceMarkup = accessibleChoiceHarness.inputMarkup(question("I2"), null, false);
assert.equal((i2ChoiceMarkup.match(/aria-label=/g) || []).length, 3, "each visual-only FRA20 model choice must expose its approved accessible label");

const resumable = migrated.freshState();
resumable.started = true;
resumable.cursor = "FRESH:FRA-20-C-I1";
resumable.drafts["FRA-20-C-I1"] = { n: "7", d: "13" };
resumable.evidence.hintOpened["FRA-20-I1"] = true;
resumable.evidence.pendingNoHintConfirmations = ["FRA-20-C-I1"];
resumable.narrationResume = { active: true, cursor: "I1", utteranceIds: ["I1-U01"], index: 0, elapsedMs: 500, action: null };
localStorage.setItem(storageKey, JSON.stringify(resumable));
const resumed = new LessonEngine({}, spec, {}, { topic });
assert.equal(resumed.state.cursor, "FRESH:FRA-20-C-I1");
assert.deepEqual({ ...resumed.state.drafts["FRA-20-C-I1"] }, { n: "7", d: "13" });
assert.deepEqual([...resumed.state.evidence.pendingNoHintConfirmations], ["FRA-20-C-I1"]);
assert.equal(resumed.state.narrationResume.utteranceIds[0], "I1-U01");

const routeHarness = Object.create(LessonEngine.prototype);
routeHarness.spec = spec;
routeHarness.model = resumed.model;
routeHarness.emit = () => {};
routeHarness.state = migrated.freshState();
routeHarness.state.evidence.firstAttemptCorrect["FRA-20-G1"] = true;
routeHarness.state.evidence.firstAttemptCorrect["FRA-20-G2"] = true;
assert.equal(routeHarness.adaptiveNextId(routeHarness.model.getNode("G2")), "F2", "clean guided evidence must skip F1 and retain F2");
routeHarness.state.evidence.supportEscalated["FRA-20-G2"] = true;
assert.equal(routeHarness.adaptiveNextId(routeHarness.model.getNode("G2")), "F1", "supported guided evidence must retain F1");
routeHarness.state.evidence.pendingNoHintConfirmations = ["FRA-20-C-I1"];
assert.equal(routeHarness.adaptiveNextId(routeHarness.model.getNode("I2")), "FRESH:FRA-20-C-I1", "hint-supported success must route to its fresh no-hint confirmation");

console.log("FRA20 source validator, exact runtime/caption/cue parity, 1,000-seed recovery selection, mathematics, visuals, migration/resume, adaptive and final-route tests: PASS");
