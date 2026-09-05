import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const fractionsDir = path.resolve(testsDir, "..");
const workspaceRoot = path.resolve(fractionsDir, "..");
const require = createRequire(import.meta.url);
const ts = require(path.join(workspaceRoot, "revily-site/node_modules/typescript/lib/typescript.js"));
const yaml = require(path.join(workspaceRoot, "revily-site/node_modules/js-yaml"));
let checks = 0;
const plain = (value) => JSON.parse(JSON.stringify(value));

function check(name, action) {
  action();
  checks += 1;
  process.stdout.write(`PASS ${String(checks).padStart(2, "0")} ${name}\n`);
}

const sourcePath = path.join(workspaceRoot, "src/lessons/fractions/FRA-18/LessonSpec.ts");
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
  fileName: sourcePath,
  reportDiagnostics: true
});
const compileErrors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
const sourceModule = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: sourceModule, exports: sourceModule.exports }, { filename: sourcePath });
const authoritative = sourceModule.exports;

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
  crypto: { randomUUID: () => "fra18-test-attempt" },
  RevilyTopics: { all: [{ id: "fractions", title: "Fractions", storageNamespace: "fractions", skillIdPattern: "^FRA-" }] },
  setTimeout,
  clearTimeout
};
windowObject.window = windowObject;
const documentStub = { addEventListener() {}, removeEventListener() {}, hidden: false, body: { contains: () => false } };
const context = vm.createContext({
  window: windowObject,
  localStorage,
  document: documentStub,
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

load("js/fra18-approved-spec.js");
load("js/fra18-canonical.js");
load("js/validators.js");
load("js/lesson-model.js");
windowObject.RevilyVisuals = { escapeHtml: String };
load("js/fra18-visuals.js");

const source = windowObject.RevilyFra18V1;
const canonical = windowObject.RevilyFra18Canonical;
const legacy = yaml.load(fs.readFileSync(path.join(workspaceRoot, "FRA 01 to 28/revily_fractions_v1_2/skills/FRA-18_COMPLETE_v1.2.yaml"), "utf8"));
const spec = canonical.apply(legacy);
const model = windowObject.RevilyLessonModel.buildLessonModel(spec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-18-${id}`);

check("authoritative TypeScript compiles", () => assert.deepEqual(compileErrors, []));
check("authoritative canonical validator passes", () => assert.equal(authoritative.validateFRA18CanonicalSpec().length, 0));
check("authoritative static assertions pass", () => assert.equal(authoritative.runFRA18StaticAssertions().length, 0));
check("generated runtime contains exactly 49 authored Ryan utterances", () => assert.equal(Object.keys(source.runtimeCopy).length, 49));
check("generated runtime text is byte-for-byte authoritative", () => {
  assert.deepEqual(Object.keys(source.runtimeCopy), Object.keys(authoritative.FRA18_RUNTIME_COPY));
  Object.entries(source.runtimeCopy).forEach(([id, entry]) => assert.equal(entry.text, authoritative.FRA18_RUNTIME_COPY[id].text, id));
});
check("all captions resolve from the same audio utterance", () => Object.entries(source.runtimeCopy).forEach(([id, entry]) => assert.equal(entry.captionSource, "same_as_audio", id)));
check("canonical cue and runtime contract passes", () => assert.deepEqual(plain(canonical.validateRuntimeContract()), []));
check("all 37 authored questions are present", () => assert.equal(source.questions.length, 37));
check("canonical identity and content version replace the legacy lesson", () => {
  assert.equal(spec.identity.id, "FRA-18");
  assert.equal(spec.identity.title, "Add Fractions Where One Denominator Is a Multiple of the Other");
  assert.equal(spec.canonical_lesson.version, "fra18-simplified-storyboard-v1-handoff-1");
});
check("Diagnostic and Retrieval remain disabled and empty", () => {
  assert.equal(spec.diagnostic.enabled, false);
  assert.equal(spec.retrieval_practice.enabled, false);
  assert.deepEqual(plain(spec.diagnostic.question_refs), []);
  assert.deepEqual(plain(spec.retrieval_practice.question_refs), []);
});
check("approved teaching scenes and unscored hook interaction are wired in order", () => {
  assert.deepEqual(plain(spec.lesson.teaching_steps.slice(0, 9).map((step) => step.id)), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "T5", "T6", "HANDOFF"]);
  assert.equal(question("HOOK").policy.engagementOnly, true);
});
check("guided, faded and independent transfer order is exact", () => {
  assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
  assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1");
  assert.equal(spec.lesson.transfer_steps.I2.correct_next, "FINAL-INTRO");
});
check("final check contains the authored uninterrupted M1-M5 sequence", () => assert.deepEqual(plain(spec.lesson.exit.primary_question_refs), ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-18-${id}`)));

const runtimeTexts = new Set(Object.values(source.runtimeCopy).map((entry) => entry.text));
check("every spoken adapter string comes from FRA18_RUNTIME_COPY text", () => {
  spec.lesson.teaching_steps.flatMap((step) => step.narration?.script || []).forEach((line) => assert.ok(runtimeTexts.has(line), line));
  spec.question_bank.forEach((item) => {
    (item.runtimeUtteranceIds || []).forEach((id) => assert.ok(source.runtimeCopy[id], `${item.id}: ${id}`));
    const spoken = [item.scripts?.before_submit, item.scripts?.on_correct_reaction, item.scripts?.on_incorrect_reaction, item.scripts?.reteach, item.scripts?.worked_narration].flat(Infinity).filter(Boolean);
    spoken.forEach((line) => assert.ok(runtimeTexts.has(line), `${item.id}: ${line}`));
  });
});
check("prompts, hints and worked steps are never promoted to spoken scripts", () => spec.question_bank.forEach((item) => {
  const spoken = [item.scripts?.before_submit, item.scripts?.on_correct_reaction, item.scripts?.on_incorrect_reaction, item.scripts?.reteach, item.scripts?.worked_narration].flat(Infinity).filter(Boolean);
  assert.ok(!spoken.includes(item.prompt), item.id);
  if (item.mathematical_support?.hint_1) assert.ok(!spoken.includes(item.mathematical_support.hint_1), item.id);
  (item.scripts?.worked_steps || []).forEach((step) => assert.ok(!spoken.includes(step), `${item.id}: ${step}`));
}));
check("every speech-led cue uses an anchor in its exact utterance", () => {
  [...source.teachingScenes, ...source.questions].flatMap((owner) => owner.timeline || []).forEach((cue) => {
    assert.ok(source.runtimeCopy[cue.utteranceId]);
    assert.ok(source.runtimeCopy[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()), cue.id);
  });
});
check("M1 correct and incorrect runtime outcomes are distinct and mutually exclusive", () => {
  assert.deepEqual(plain(canonical.selectOutcomeUtteranceIds(question("M1"), { n: "5", d: "12" })), ["FINAL.CORRECT.DEFAULT"]);
  assert.deepEqual(plain(canonical.selectOutcomeUtteranceIds(question("M1"), { n: "2", d: "15" })), ["FINAL.INCORRECT.DEFAULT"]);
  assert.notEqual(source.runtimeCopy["FINAL.CORRECT.DEFAULT"].text, source.runtimeCopy["FINAL.INCORRECT.DEFAULT"].text);
});
check("M2-M5 outcomes remain UI-only", () => ["M2", "M3", "M4", "M5"].forEach((id) => {
  assert.deepEqual(plain(question(id).runtimeOutcome.correctUtteranceIds), []);
  assert.deepEqual(plain(question(id).runtimeOutcome.incorrectUtteranceIds), []);
}));

check("G1 accepts the exact authored staged fields", () => assert.equal(canonical.evaluateResponse(question("G1"), { convertedNumerator: "3", sumNumerator: "5" }).correct, true));
check("G1 classifies denominator-only conversion", () => assert.equal(canonical.evaluateResponse(question("G1"), { convertedNumerator: "1", sumNumerator: "3" }).errorFamily, "DEN-ONLY"));
check("G2 distinguishes selecting the already-ready operand", () => assert.equal(canonical.evaluateResponse(question("G2"), { selectedOperand: "left", convertedNumerator: "4", sumNumerator: "9" }).errorFamily, "READY-OPERAND"));
check("G2 accepts changing the second operand", () => assert.equal(canonical.evaluateResponse(question("G2"), { selectedOperand: "right", convertedNumerator: "4", sumNumerator: "9" }).correct, true));
check("F2 accepts only the authored valid first line", () => {
  assert.equal(canonical.evaluateResponse(question("F2"), "1/7 = 2/14; 3/14 stays.").correct, true);
  assert.equal(canonical.evaluateResponse(question("F2"), "Change both fractions to denominator 28.").errorFamily, "BOTH-CHANGE");
});
check("exact equivalent fractions are accepted on value questions", () => assert.equal(canonical.evaluateResponse(question("I1"), { n: "14", d: "20" }).correct, true));
check("malformed fraction input is neutral, not a misconception", () => {
  const result = canonical.evaluateResponse(question("I1"), { n: "", d: "10" });
  assert.equal(result.valid, false);
  assert.equal(result.errorFamily, null);
});
check("old-numerator and retained-denominator families remain distinct", () => {
  assert.equal(canonical.evaluateResponse(question("M3"), { convertedNumerator: "6", sumNumerator: "8" }).errorFamily, "OLD-NUM");
  assert.equal(canonical.evaluateResponse(question("D-DENOM"), { sumNumerator: "8", finalDenominator: "36" }).errorFamily, "DEN-ADD");
});

const clean = { firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false, errorFamilies: [] };
check("strong guided evidence skips F1", () => assert.equal(canonical.shouldSkipF1({ g1: clean, g2: clean }), true));
check("strong route still retains F2", () => assert.deepEqual(plain(source.spec.adaptiveRouting.strongSequence), ["G1", "G2", "F2", "I1", "I2"]));
check("hint or central-error evidence prevents the strong route", () => {
  assert.equal(canonical.shouldSkipF1({ g1: { ...clean, hintOpenedBeforeSubmit: true }, g2: clean }), false);
  assert.equal(canonical.shouldSkipF1({ g1: { ...clean, errorFamilies: ["DEN-ONLY"] }, g2: clean }), false);
});
check("independent hinted successes require their authored fresh confirmations", () => {
  assert.equal(canonical.getRequiredHintConfirmation("FRA-18-I1", ["ONE_CONVERSION"]), "FRA-18-C1");
  assert.equal(canonical.getRequiredHintConfirmation("FRA-18-I2", ["ONE_CONVERSION"]), "FRA-18-C2");
});
check("later clean independent evidence satisfies an earlier faded hint", () => assert.equal(canonical.getRequiredHintConfirmation("FRA-18-F1", ["ONE_CONVERSION"]), null));
check("denominator repair recheck avoids F1 repetition", () => {
  assert.equal(canonical.selectDenomRepairCheck([]), "FRA-18-R4-CHECK");
  assert.equal(canonical.selectDenomRepairCheck(["FRA-18-F1"]), "FRA-18-R4-CHECK-ALT");
});
check("each repair has a supported interaction and authored fresh recheck", () => source.repairs.forEach((repair) => {
  const converted = question(repair.id);
  assert.equal(converted.supportedInteractionId, `FRA-18-${repair.supportedQuestionId}`);
  assert.ok(converted.freshCheckId.startsWith("FRA-18-R"));
}));

const finalRecord = (id, correct, families = []) => ({ questionId: `FRA-18-${id}`, correctFirstAttempt: correct, supported: false, errorFamilies: families });
check("4/5 with procedural and reasoning/application evidence finishes", () => {
  const route = canonical.routeFinal([finalRecord("M1", true), finalRecord("M2", true), finalRecord("M3", true), finalRecord("M4", true), finalRecord("M5", false, ["UNKNOWN"])]);
  assert.equal(route.kind, "finish");
});
check("3/5 routes to targeted repair then exactly two fresh items", () => {
  const route = canonical.routeFinal([finalRecord("M1", true), finalRecord("M2", true), finalRecord("M3", true), finalRecord("M4", false, ["DEN-ONLY"]), finalRecord("M5", false, ["DEN-ONLY"])]);
  assert.equal(route.kind, "repair_then_mini_check");
  assert.equal(route.recoveryIds.length, 2);
  assert.equal(route.requiredCorrect, 2);
  assert.deepEqual(plain(route.repairIds), ["FRA-18-R-EQUIV"]);
});
check("4/5 with a repeated blocker also routes to the two-item gate", () => {
  const route = canonical.routeFinal([finalRecord("M1", true, ["DEN-ADD", "DEN-ADD"]), finalRecord("M2", true), finalRecord("M3", true), finalRecord("M4", true), finalRecord("M5", false, ["UNKNOWN"])]);
  assert.equal(route.kind, "repair_then_mini_check");
});
check("0-2/5 routes to the authored five-item alternate final", () => {
  const route = canonical.routeFinal([finalRecord("M1", true), finalRecord("M2", true), finalRecord("M3", false, ["OLD-NUM"]), finalRecord("M4", false, ["DEN-ONLY"]), finalRecord("M5", false, ["BOTH-CHANGE"])]);
  assert.equal(route.kind, "repair_then_alternate_final");
  assert.deepEqual(plain(route.recoveryIds), ["AF1", "AF2", "AF3", "AF4", "AF5"].map((id) => `FRA-18-${id}`));
  assert.equal(route.requiredCorrect, 4);
});
check("all primary final answers lock before working", () => spec.lesson.exit.primary_question_refs.forEach((id) => {
  const item = spec.question_bank.find((candidate) => candidate.id === id);
  assert.equal(item.policy.answerLocksOnSubmit, true);
  assert.equal(item.policy.solutionPolicy, "after_locked_submit");
  assert.ok(item.scripts.worked_steps.length >= 2);
}));

check("visual working is absent before lock and present after lock", () => {
  const before = windowObject.RevilyFra18Visuals.renderMarkup(question("M1").visual, { question: question("M1"), feedback: "initial" });
  const after = windowObject.RevilyFra18Visuals.renderMarkup(question("M1").visual, { question: question("M1"), feedback: "worked" });
  assert.ok(!before.includes("fra18-working"));
  assert.ok(after.includes("fra18-working"));
});
check("hook uses the approved battery geometry and withholds the total", () => {
  const hook = windowObject.RevilyFra18Visuals.renderMarkup({ scene: { model: { context: "fra18", sceneId: "HOOK" } } }, {});
  assert.ok(hook.includes("fra18-battery"));
  assert.ok(hook.includes("1/4") && hook.includes("4/12"));
  assert.ok(!hook.includes("7/12"));
});
check("FRA-18 CSS covers 390px stacking and reduced motion", () => {
  const css = fs.readFileSync(path.join(fractionsDir, "fra18.css"), "utf8");
  assert.match(css, /@media\(max-width:520px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /animation:none!important/);
  assert.match(css, /transition:none!important/);
  assert.ok(fs.readFileSync(path.join(testsDir, "fra18-responsive.html"), "utf8").includes("width: 390px"));
});
check("active page registers all FRA-18 assets", () => {
  const html = fs.readFileSync(path.join(fractionsDir, "index.html"), "utf8");
  ["fra18.css", "fra18-approved-spec.js", "fra18-canonical.js", "fra18-loader-profile.js", "fra18-visuals.js", "fra18-engine-profile.js"].forEach((asset) => assert.ok(html.includes(asset), asset));
});

windowObject.RevilyVisuals = { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render() {} };
windowObject.RevilyNarrationSync = { NarrationSync: class NarrationSync { stop() {} } };
load("js/lesson-engine.js");
load("js/fra18-engine-profile.js");
const LessonEngine = windowObject.RevilyLessonEngine.LessonEngine;

check("legacy FRA-18 persistence migrates to a clean HOOK attempt", () => {
  const storageKey = "revily.fractions.FRA-18.current.v1";
  localStorage.setItem(storageKey, JSON.stringify({ version: 1, contentVersion: "legacy-fra18-yaml", topicId: "fractions", skillId: "FRA-18", cursor: "D01", drafts: { old: "stale" }, soundOn: false, developerOpen: true, status: "COMPLETE", exit: { result: "SECURE" } }));
  const engine = new LessonEngine({}, spec, {}, { topic: { id: "fractions", title: "Fractions", storageNamespace: "fractions" } });
  assert.equal(engine.state.cursor, "HOOK");
  assert.equal(engine.state.soundOn, false);
  assert.equal(engine.state.developerOpen, true);
  assert.deepEqual({ ...engine.state.drafts }, {});
  assert.equal(engine.state.contentMigration.to, "fra18-simplified-storyboard-v1-handoff-1");
  const history = JSON.parse(localStorage.getItem("revily.fractions.FRA-18.history.v1"));
  assert.equal(history.at(-1).completionResult, "SECURE");
});

check("engine strong-route gate skips only F1", () => {
  const harness = Object.create(LessonEngine.prototype);
  harness.spec = spec;
  harness.model = model;
  harness.emit = () => {};
  harness.state = Object.create(null);
  const freshEngine = new LessonEngine({}, spec, {}, { topic: { id: "fractions", title: "Fractions", storageNamespace: "fractions" } });
  harness.state = freshEngine.freshState();
  ["FRA-18-G1", "FRA-18-G2"].forEach((id) => { harness.state.evidence.firstAttemptCorrect[id] = true; });
  assert.equal(harness.adaptiveNextId(model.getNode("G2")), "F2");
  harness.state.evidence.hintOpenedBeforeSubmit["FRA-18-G2"] = true;
  assert.equal(harness.adaptiveNextId(model.getNode("G2")), "F1");
});

check("engine final routing starts the matching repair for 3/5", () => {
  const engine = new LessonEngine({}, spec, {}, { topic: { id: "fractions", title: "Fractions", storageNamespace: "fractions" } });
  const harness = Object.create(LessonEngine.prototype);
  harness.spec = spec;
  harness.model = model;
  harness.emit = () => {};
  harness.state = engine.freshState();
  harness.state.cursor = "M5";
  model.exitIds.forEach((id, index) => {
    harness.state.exit.responses[id] = { response: "test", correct: index < 3 };
    harness.state.attempts[id] = 1;
  });
  harness.state.evidence.candidateErrorFamily["FRA-18-M4"] = "DEN-ONLY";
  harness.state.evidence.candidateErrorFamily["FRA-18-M5"] = "DEN-ONLY";
  harness.routeFra18FinalEvidence();
  assert.equal(harness.state.exit.remediation.route, "repair_then_mini_check");
  assert.equal(harness.state.pendingRecovery.recoveryId, "FRA-18-R-EQUIV");
  assert.equal(harness.state.exit.remediation.recoveryIds.length, 2);
});

process.stdout.write(`\nFRA-18 contract suite passed: ${checks} checks.\n`);
