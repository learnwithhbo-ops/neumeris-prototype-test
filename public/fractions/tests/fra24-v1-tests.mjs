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
const plain = (value) => JSON.parse(JSON.stringify(value));
let checks = 0;

function check(name, fn) {
  fn();
  checks += 1;
  console.log(`PASS ${String(checks).padStart(2, "0")} ${name}`);
}

function compileOwnerSource() {
  const specPath = path.join(workspaceRoot, "FRA24_CANONICAL_SPEC.ts");
  const compiled = ts.transpileModule(fs.readFileSync(specPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
    fileName: specPath,
    reportDiagnostics: true
  });
  const errors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, errors.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")).join("\n"));
  const moduleRecord = { exports: {} };
  vm.runInNewContext(compiled.outputText, { module: moduleRecord, exports: moduleRecord.exports }, { filename: specPath });
  return moduleRecord.exports;
}

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const owner = compileOwnerSource();
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
  crypto: { randomUUID: () => "fra24-test-attempt" },
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

load("js/fra24-approved-spec.js");
load("js/fra24-canonical.js");
load("js/fra24-visuals.js");
load("js/validators.js");
load("js/lesson-model.js");
load("js/narration-sync.js");

windowObject.RevilyVisuals = { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render() {} };
windowObject.RevilyNarrationAssets = { voice: "en-GB-RyanNeural", voiceName: "Microsoft Ryan Online (Natural) - English (United Kingdom)", tracks: {} };

const browserSource = windowObject.RevilyFra24ApprovedSpec;
const adapter = windowObject.RevilyFra24Canonical;
const visuals = windowObject.RevilyFra24Visuals;
const baseSpec = {
  schema_version: "1.2",
  identity: { id: "FRA-24", title: "Legacy FRA24" },
  dependencies: { required_skill_refs: [] },
  diagnostic: {},
  retrieval_practice: {},
  lesson: {},
  completion: {},
  voice_and_script: {},
  visual_language: {},
  engine_capability_requirements: {},
  experience_contract: { global_ui_copy: {} }
};
const spec = adapter.apply(structuredClone(baseSpec));
const model = windowObject.RevilyLessonModel.buildLessonModel(spec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-24-${id}`);
const rawProduct = (item) => ({
  numerator: item.factors.first.numerator * item.factors.second.numerator,
  denominator: item.factors.first.denominator * item.factors.second.denominator
});
const reducedProduct = (item) => owner.reduceFraction(rawProduct(item));

function correctSubmission(item) {
  if (item.answerPolicy.kind === "choice_B") return { kind: "choice", optionId: "B" };
  if (item.answerPolicy.kind === "missing_denominator") return { kind: "integer", value: rawProduct(item).denominator };
  const value = item.answerPolicy.kind === "fraction_simplest" ? reducedProduct(item) : rawProduct(item);
  return { kind: "fraction", ...value };
}

function correctAdapterResponse(item) {
  const converted = question(item.id);
  if (item.answerPolicy.kind === "choice_B") return item.learnerUi.options.find((option) => option.id === "B").text;
  if (item.answerPolicy.kind === "missing_denominator") return String(rawProduct(item).denominator);
  const value = item.answerPolicy.kind === "fraction_simplest" ? reducedProduct(item) : rawProduct(item);
  assert.ok(converted);
  return { n: String(value.numerator), d: String(value.denominator) };
}

function wrongSubmission(item) {
  if (item.answerPolicy.kind === "choice_B") return { kind: "choice", optionId: "A" };
  if (item.answerPolicy.kind === "missing_denominator") return { kind: "integer", value: 997 };
  return { kind: "fraction", numerator: 997, denominator: 991 };
}

function evidence(id, correct, family = null) {
  return {
    questionId: id,
    firstAttemptCorrect: correct,
    attempts: 1,
    hintOpenedBeforeSubmit: false,
    supportEscalated: false,
    supportLevel: "final",
    answerLocked: true,
    errorFamilyHypothesis: family,
    freshConfirmationPassed: false,
    mathematicallyEquivalentButFormIncomplete: false
  };
}

check("owner TypeScript compiles and all three mandated validators pass", () => {
  assert.deepEqual(plain(owner.validateFRA24CanonicalSpec()), []);
  assert.doesNotThrow(() => owner.assertFRA24CanonicalSpec());
  assert.deepEqual(plain(owner.runFRA24StaticAssertions()), []);
  assert.deepEqual(plain(adapter.validateRuntimeContract()), []);
});

check("browser artifact preserves the authoritative TypeScript exports", () => {
  for (const key of ["FRA24", "FRA24_RUNTIME_COPY", "FRA24_CUES", "FRA24_TEACHING_SCENES", "FRA24_QUESTIONS", "FRA24_CONFIRMATIONS", "FRA24_REPAIR_ITEMS", "FRA24_REPAIRS", "FRA24_RECOVERY_ITEMS", "FRA24_ROUTE"]) {
    assert.deepEqual(plain(browserSource[key]), plain(owner[key]), key);
  }
});

check("identity, route and content version replace the legacy lesson in place", () => {
  assert.equal(spec.identity.id, "FRA-24");
  assert.equal(spec.identity.title, "Multiply Two Fractions");
  assert.equal(spec.identity.status, "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1");
  assert.equal(spec.canonical_lesson.version, "fra24-canonical-handoff-v1");
  assert.equal(spec.canonical_lesson.engine_profile, "fra24");
  assert.deepEqual(plain(model.nodes.map((node) => node.id)), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "HANDOFF", "G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"]);
  assert.deepEqual(plain(spec.lesson.practice.question_order), []);
});

check("Diagnostic and Retrieval stay disabled and completion adds no future layer", () => {
  assert.equal(spec.diagnostic.enabled, false);
  assert.equal(spec.retrieval_practice.enabled, false);
  assert.deepEqual(plain(spec.diagnostic.question_refs), []);
  assert.deepEqual(plain(spec.retrieval_practice.question_refs), []);
  assert.deepEqual(plain(spec.completion.secure.buttons), ["Back to Fractions", "Start again"]);
  assert.ok(!JSON.stringify({ route: spec.canonical_lesson.route_contract, completion: spec.completion }).includes("FRA-25"));
});

check("all 35 canonical question-like items, eight repairs and hook are present once", () => {
  assert.equal(Object.keys(owner.FRA24_ALL_QUESTIONS).length, 35);
  assert.equal(Object.keys(owner.FRA24_REPAIRS).length, 8);
  assert.equal(spec.question_bank.length, 44);
  assert.equal(new Set(spec.question_bank.map((item) => item.id)).size, 44);
  Object.keys(owner.FRA24_ALL_QUESTIONS).forEach((id) => assert.ok(question(id), id));
});

check("all canonical question-like items accept their authorised answer", () => {
  for (const item of Object.values(owner.FRA24_ALL_QUESTIONS)) {
    assert.equal(owner.markFRA24Response(item.id, correctSubmission(item)).correct, true, item.id);
    assert.equal(adapter.evaluateResponse(question(item.id), correctAdapterResponse(item)).correct, true, item.id);
  }
});

check("all canonical question-like items reject a deliberately wrong answer", () => {
  for (const item of Object.values(owner.FRA24_ALL_QUESTIONS)) {
    assert.equal(owner.markFRA24Response(item.id, wrongSubmission(item)).correct, false, item.id);
  }
});

check("every single-choice option remains exact and executable", () => {
  for (const item of Object.values(owner.FRA24_ALL_QUESTIONS).filter((candidate) => candidate.response.kind === "single_choice")) {
    const converted = question(item.id);
    assert.deepEqual(plain(converted.response.options), plain(item.learnerUi.options.map((option) => option.text)), item.id);
    for (const option of item.learnerUi.options) {
      const marked = adapter.evaluateResponse(converted, option.text);
      assert.equal(marked.correct, option.id === "B", `${item.id}/${option.id}`);
    }
  }
});

check("exact equivalents are accepted unless simplest form is requested", () => {
  assert.equal(adapter.evaluateResponse(question("M2"), { n: "1", d: "2" }).correct, true);
  const i1Raw = rawProduct(owner.FRA24_ALL_QUESTIONS.I1);
  assert.equal(adapter.evaluateResponse(question("I1"), { n: String(i1Raw.numerator * 2), d: String(i1Raw.denominator * 2) }).correct, true);
  const m5 = adapter.evaluateResponse(question("M5"), { n: "15", d: "30" });
  assert.equal(m5.correct, false);
  assert.equal(m5.valueCorrect, true);
  assert.equal(m5.formCorrect, false);
  assert.equal(m5.errorFamily, "form");
});

check("all authored misconception signatures classify from the submitted mathematics", () => {
  const m1Factors = owner.FRA24_ALL_QUESTIONS.M1.factors;
  const m1Raw = rawProduct(owner.FRA24_ALL_QUESTIONS.M1);
  assert.equal(adapter.evaluateResponse(question("M1"), { n: String(m1Factors.first.numerator + m1Factors.second.numerator), d: String(m1Factors.first.denominator + m1Factors.second.denominator) }).errorFamily, "add");
  assert.equal(adapter.evaluateResponse(question("M1"), { n: String(m1Factors.first.numerator * m1Factors.second.denominator), d: String(m1Factors.first.denominator * m1Factors.second.numerator) }).errorFamily, "cross");
  assert.equal(adapter.evaluateResponse(question("M1"), { n: String(m1Raw.numerator), d: String(m1Factors.first.denominator) }).errorFamily, "keep_denominator");
  assert.equal(adapter.evaluateResponse(question("M1"), { n: "997", d: "991", methodEvidence: "common_denominator_first" }).errorFamily, "common_denominator_needed");
  assert.equal(adapter.evaluateResponse(question("I2"), { n: "10", d: "21", methodEvidence: "cannot_multiply_improper" }).errorFamily, "improper_invalid");
  assert.equal(adapter.evaluateResponse(question("I2"), { n: "10", d: "21", methodEvidence: "convert_improper_first" }).errorFamily, "mixed_conversion");
  const arithmetic = adapter.evaluateResponse(question("I2"), { n: "10", d: "21", methodEvidence: "row_structure_correct" });
  assert.equal(arithmetic.errorFamily, "arithmetic_slip");
  assert.equal(arithmetic.outcomeSignal, "row_error");
  assert.equal(adapter.evaluateResponse(question("M2"), { n: "5", d: "12" }).outcomeSignal, "overlap_error");
  assert.equal(adapter.evaluateResponse(question("M2"), { n: "6", d: "13" }).outcomeSignal, "whole_error");
});

check("every correct and incorrect runtime branch resolves to exactly its authored utterance", () => {
  for (const item of Object.values(owner.FRA24_ALL_QUESTIONS)) {
    const converted = question(item.id);
    const correctIds = adapter.selectOutcomeUtteranceIds(converted, correctAdapterResponse(item), true);
    assert.deepEqual(plain(correctIds), [item.runtime.outcomeUtteranceIds.correct], `${item.id}/correct`);
    for (const [signal, utteranceId] of Object.entries(item.runtime.outcomeUtteranceIds.incorrectBySignal)) {
      assert.notEqual(utteranceId, item.runtime.outcomeUtteranceIds.correct, `${item.id}/${signal}`);
      assert.equal(adapter.visibleFeedback(converted, null, false, signal), owner.FRA24_RUNTIME_COPY[utteranceId].text, `${item.id}/${signal}`);
    }
    const wrongIds = adapter.selectOutcomeUtteranceIds(converted, correctAdapterResponse(item), false);
    assert.ok(!wrongIds.includes(item.runtime.outcomeUtteranceIds.correct), `${item.id}: wrong branch played correct line`);
  }
});

check("Ryan audio, captions and cues have one exact owner registry", () => {
  assert.equal(Object.keys(owner.FRA24_RUNTIME_COPY).length, 136);
  assert.equal(owner.FRA24_CUES.length, 26);
  assert.deepEqual(Object.keys(browserSource.FRA24_RUNTIME_COPY), Object.keys(owner.FRA24_RUNTIME_COPY));
  for (const [id, entry] of Object.entries(browserSource.FRA24_RUNTIME_COPY)) {
    assert.equal(entry.text, owner.FRA24_RUNTIME_COPY[id].text, id);
    assert.equal(entry.captionSource, "same_as_audio", id);
    assert.equal(spec.canonical_lesson.runtime_copy_text_to_id[entry.text], id, id);
  }
  for (const cue of browserSource.FRA24_CUES) {
    assert.ok(browserSource.FRA24_RUNTIME_COPY[cue.utteranceId], cue.id);
    assert.ok(browserSource.FRA24_RUNTIME_COPY[cue.utteranceId].text.includes(cue.anchor), cue.id);
  }
});

check("no unregistered string enters a Ryan-spoken field", () => {
  const registered = new Set(Object.values(owner.FRA24_RUNTIME_COPY).map((entry) => entry.text));
  const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten) : value && typeof value === "object" ? Object.values(value).flatMap(flatten) : typeof value === "string" && value ? [value] : [];
  const spokenFields = [];
  for (const step of spec.lesson.teaching_steps) spokenFields.push(step.narration?.script);
  spokenFields.push(spec.lesson.exit.intro_script, spec.completion.secure.ryan_script);
  for (const item of spec.question_bank) {
    spokenFields.push(item.scripts?.before_submit, item.scripts?.hint, item.scripts?.on_correct_reaction, item.scripts?.on_correct_math, item.scripts?.on_incorrect_reaction, item.scripts?.on_incorrect_attempt_1, item.scripts?.on_incorrect_attempt_2, item.scripts?.reteach, item.scripts?.engagement_response_by_value, item.scripts?.worked_narration);
    assert.equal(Object.prototype.hasOwnProperty.call(item, "captionText"), false, item.id);
  }
  flatten(spokenFields).forEach((line) => assert.ok(registered.has(line), line));
  assert.deepEqual(plain(question("F2").scripts.before_submit), []);
  assert.deepEqual(plain(question("F2").runtimeUtteranceIds.filter((id) => id.startsWith("F2.PRE"))), []);
});

check("prompts, options, controls and worked checks are not automatic narration", () => {
  for (const item of spec.question_bank) {
    const automaticBeforeSubmit = item.scripts?.before_submit || [];
    assert.ok(!automaticBeforeSubmit.includes(item.prompt), `${item.id} prompt leaked`);
    for (const option of item.response?.options || []) assert.ok(!automaticBeforeSubmit.includes(option), `${item.id} option leaked`);
    for (const step of item.scripts?.worked_steps || []) {
      assert.ok(!automaticBeforeSubmit.includes(step), `${item.id} worked step leaked`);
      assert.ok(!(item.scripts?.worked_narration || []).includes(step), `${item.id} worked step was narrated`);
    }
  }
  assert.ok(spec.question_bank.every((item) => !(item.scripts?.before_submit || []).includes("Check answer")));
  assert.ok(spec.question_bank.every((item) => !(item.scripts?.before_submit || []).includes("Reveal the scan")));
});

check("voice and caption settings use the current strict Ryan workflow", () => {
  assert.equal(spec.voice_and_script.narrator, "Ryan");
  assert.equal(spec.voice_and_script.voice_id, "en-GB-RyanNeural");
  assert.equal(spec.voice_and_script.narration_playback.mode, "browser_speech_ryan");
  assert.equal(spec.voice_and_script.narration_playback.require_ryan_voice, true);
  assert.equal(spec.voice_and_script.narration_playback.timing_source, "provider_word_boundaries_with_deterministic_fallback");
  assert.equal(spec.voice_and_script.caption_presentation.mode, "on_canvas_progressive");
  assert.equal(spec.voice_and_script.caption_presentation.transcript_bar, false);
});

check("the map hook stays unscored and branches distinctly before the common reveal", () => {
  const hook = question("HOOK-CHOICE");
  assert.equal(hook.policy.engagementOnly, true);
  assert.equal(hook.policy.scored, false);
  const branches = hook.scripts.engagement_response_by_value;
  assert.equal(new Set(Object.values(branches).map((lines) => lines[0])).size, 4);
  for (const lines of Object.values(branches)) assert.deepEqual(lines.slice(1), Object.values(branches)[0].slice(1));
  assert.equal(hook.runtimeOutcome.responseUtteranceIdsByValue["Exactly half"][0], "HOOK.FEEDBACK.EXACT");
});

check("area overlap precedes the direct symbolic rule and T4 geometry is exact", () => {
  const teaching = owner.FRA24_TEACHING_SCENES;
  assert.equal(teaching.HOOK.visual.firstFraction.numerator, 3);
  assert.equal(teaching.HOOK.visual.firstFraction.denominator, 4);
  assert.equal(teaching.HOOK.visual.secondFraction.numerator, 2);
  assert.equal(teaching.HOOK.visual.secondFraction.denominator, 3);
  assert.equal(teaching.T4.visual.referenceWholeColumns, 4);
  assert.equal(teaching.T4.visual.visibleColumns, 5);
  assert.equal(teaching.T4.visual.rows, 7);
  const t4 = visuals.renderMarkup(model.getNode("T4").visual, {});
  assert.equal((t4.match(/class="fra24-cell/g) || []).length, 35);
  assert.equal((t4.match(/is-reference-edge/g) || []).length, 7);
  assert.ok(t4.includes("4 × 7 = <b>28</b>"));
  assert.ok(t4.includes(">15<") && t4.includes(">28<"));
  assert.ok(!t4.includes("35"));
  assert.ok(!t4.toLowerCase().includes("mixed number"));
});

check("the hook result is hidden until authored reveal cues and has no ghost caption surface", () => {
  const hook = visuals.renderMarkup(question("HOOK-CHOICE").visual, { question: question("HOOK-CHOICE"), feedback: "initial" });
  assert.equal((hook.match(/class="fra24-cell/g) || []).length, 12);
  assert.ok(hook.includes("aria-hidden=\"true\""));
  const css = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
  assert.match(css, /\.fra24-grid-counts[\s\S]*opacity:\s*0/);
  assert.match(css, /\.fra24-hook-result[\s\S]*opacity:\s*0/);
  assert.match(css, /\.canvas-caption:empty/);
});

check("scored grids do not leak counts and final working appears only after lock", () => {
  for (const id of ["M1", "M2", "M3", "M4", "M5"]) {
    const item = question(id);
    assert.equal(item.policy.hintPolicy, "none", id);
    assert.equal(item.policy.answerLocksOnSubmit, true, id);
    assert.equal(item.policy.solutionPolicy, "after_locked_submit", id);
    const initial = visuals.renderMarkup(item.visual, { question: item, feedback: "initial" });
    const worked = visuals.renderMarkup(item.visual, { question: item, feedback: "worked" });
    assert.ok(!initial.includes("fra24-worked"), id);
    assert.ok(worked.includes("fra24-worked"), id);
    if (item.canonicalQuestion.visual.kind === "area_product_grid") assert.ok(!initial.includes("fra24-grid-result"), id);
    if (["method_choice_fraction_product", "method_critique"].includes(item.canonicalQuestion.visual.kind)) assert.ok(!initial.includes("top × top"), `${id}/method leak`);
    if (!["area_product_grid", "nested_context_cards", "missing_fraction_field", "method_choice_fraction_product", "method_critique"].includes(item.canonicalQuestion.visual.kind)) {
      const raw = rawProduct(item.canonicalQuestion);
      assert.ok(!initial.includes(`<strong>${raw.numerator}</strong>`), `${id}/numerator leak`);
      assert.ok(!initial.includes(`<strong>${raw.denominator}</strong>`), `${id}/denominator leak`);
    }
  }
});

check("all learner routes have non-empty non-leaking accessible equivalents", () => {
  for (const node of model.nodes) {
    const description = visuals.accessibleDescription(node.visual?.model || node.visual, { question: node.question, feedback: "initial" });
    assert.ok(description.trim(), node.id);
    if (node.question?.canonicalQuestion?.visual.kind === "area_product_grid") assert.match(description, /not stated before submission/i, node.id);
  }
});

check("cross repair renders four keyboard-operable row cards without diagonal arrows", () => {
  const rc = question("RC-SUP");
  const markup = visuals.renderMarkup(rc.visual, { question: rc, feedback: "initial" });
  assert.equal((markup.match(/data-fra24-row-card=/g) || []).length, 4);
  assert.equal((markup.match(/<button type="button"/g) || []).length, 4);
  assert.ok(markup.includes("Numerators"));
  assert.ok(markup.includes("Denominators"));
  assert.ok(!markup.toLowerCase().includes("diagonal"));
});

check("strong guided evidence skips F1 but always retains F2", () => {
  const clean = [evidence("G1", true), evidence("G2", true)];
  assert.equal(owner.shouldSkipFRA24F1(clean), true);
  assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
  assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1");
  for (const mutate of [
    (records) => { records[0].firstAttemptCorrect = false; },
    (records) => { records[0].hintOpenedBeforeSubmit = true; },
    (records) => { records[1].supportEscalated = true; },
    (records) => { records[1].errorFamilyHypothesis = "cross"; }
  ]) {
    const records = structuredClone(clean);
    mutate(records);
    assert.equal(owner.shouldSkipFRA24F1(records), false);
  }
});

check("every optional hint queues the exact fresh no-hint confirmation", () => {
  assert.deepEqual(plain(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question), plain(Object.fromEntries(Object.entries(owner.FRA24_CONFIRMATION_MAP).map(([id, confirmationId]) => [`FRA-24-${id}`, `FRA-24-${confirmationId}`]))));
  for (const [id, confirmationId] of Object.entries(owner.FRA24_CONFIRMATION_MAP)) {
    assert.equal(question(id).policy.hintPolicy, "optional", id);
    assert.equal(question(id).policy.requiresFreshNoHintConfirmationIfHintUsed, true, id);
    assert.ok(question(confirmationId), confirmationId);
    assert.equal(question(confirmationId).policy.hintPolicy, "none", confirmationId);
    assert.deepEqual(plain(owner.requiredFRA24ConfirmationIds([{ ...evidence(id, true), hintOpenedBeforeSubmit: true }])), [confirmationId]);
  }
});

check("every authored repair maps to a supported interaction and a fresh check", () => {
  for (const [repairId, repair] of Object.entries(owner.FRA24_REPAIRS)) {
    const converted = question(repairId);
    assert.ok(converted, repairId);
    assert.equal(converted.supportedInteractionId, repair.supportedInteractionId ? `FRA-24-${repair.supportedInteractionId}` : null, repairId);
    assert.equal(converted.freshCheckId, `FRA-24-${repair.freshCheckId}`, repairId);
    if (repair.supportedInteractionId) assert.ok(question(repair.supportedInteractionId), repair.supportedInteractionId);
    assert.ok(question(repair.freshCheckId), repair.freshCheckId);
    assert.equal(spec.lesson.adaptive_pathway.repair_by_error_family[repair.errorFamily], `FRA-24-${repairId}`);
  }
});

check("primary mastery requires 4/5, direct evidence, breadth and no repeated blocker", () => {
  const fourOfFive = [evidence("M1", true), evidence("M2", true), evidence("M3", true), evidence("M4", true), evidence("M5", false, "form")];
  assert.equal(owner.evaluateFRA24Final(fourOfFive).route, "finish_candidate");
  const repeatedBlocker = [evidence("M1", true), evidence("M2", false, "keep_denominator"), evidence("M3", false, "keep_denominator"), evidence("M4", true), evidence("M5", true)];
  assert.equal(owner.evaluateFRA24Final(repeatedBlocker).route, "repair_then_two_item_check");
  const noDirect = [evidence("M1", false, "unknown"), evidence("M2", true), evidence("M3", false, "unknown"), evidence("M4", true), evidence("M5", true)];
  assert.equal(owner.evaluateFRA24Final(noDirect).route, "repair_then_two_item_check");
});

check("3/5 and 0-2/5 route to exact fresh recovery counts", () => {
  const three = [evidence("M1", true), evidence("M2", true), evidence("M3", true), evidence("M4", false, "add"), evidence("M5", false, "form")];
  const two = [evidence("M1", true), evidence("M2", true), evidence("M3", false, "cross"), evidence("M4", false, "add"), evidence("M5", false, "form")];
  assert.equal(owner.evaluateFRA24Final(three).route, "repair_then_two_item_check");
  assert.equal(owner.selectFRA24RecoveryItemIds("repair_then_two_item_check", ["add", "form"], []).length, 2);
  assert.equal(owner.evaluateFRA24Final(two).route, "repair_then_three_item_final");
  assert.equal(owner.selectFRA24RecoveryItemIds("repair_then_three_item_final", ["cross", "add", "form"], []).length, 3);
});

check("authored recovery selector passes 2,000 deterministic seeds", () => {
  const families = [["add"], ["cross"], ["keep_denominator"], ["common_denominator_needed"], ["improper_invalid"], ["form"], ["unknown"], ["add", "keep_denominator"]];
  const known = new Set(Object.keys(owner.FRA24_RECOVERY_ITEMS));
  for (let seed = 0; seed < 2000; seed += 1) {
    for (const route of ["repair_then_two_item_check", "repair_then_three_item_final"]) {
      const selected = owner.selectFRA24RecoveryItemIds(route, families[seed % families.length], [], seed);
      const repeated = owner.selectFRA24RecoveryItemIds(route, families[seed % families.length], [], seed);
      const expected = route === "repair_then_two_item_check" ? 2 : 3;
      assert.deepEqual(plain(selected), plain(repeated), `${route}/${seed}`);
      assert.equal(selected.length, expected, `${route}/${seed}`);
      assert.equal(new Set(selected).size, expected, `${route}/${seed}`);
      assert.ok(selected.every((id) => known.has(id)), `${route}/${seed}`);
      const afterSeen = owner.selectFRA24RecoveryItemIds(route, families[seed % families.length], [selected[0]], seed);
      assert.ok(!afterSeen.includes(selected[0]), `${route}/${seed}/seen`);
      if (route === "repair_then_three_item_final") {
        const intents = selected.map((id) => owner.FRA24_RECOVERY_ITEMS[id].assessmentIntent);
        assert.ok(intents.some((intent) => intent.startsWith("DIRECT") || intent.startsWith("IMPROPER")), `${route}/${seed}/direct`);
        assert.ok(intents.some((intent) => /^(VIS|CONTEXT|METHOD|FORM)/.test(intent)), `${route}/${seed}/transfer`);
      }
    }
  }
});

check("responsive, touch, keyboard and reduced-motion contracts remain explicit", () => {
  const css = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
  assert.match(css, /@media\s*\(max-width:\s*420px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.equal(owner.FRA24.responsive.mobileAuditWidthCssPixels, 390);
  assert.equal(owner.FRA24.accessibility.keyboardNavigation, true);
  for (const item of spec.question_bank.filter((candidate) => candidate.response?.type !== "continue")) assert.equal(item.response.keyboard_submit, true, item.id);
});

load("js/lesson-engine.js");
const LessonEngine = windowObject.RevilyLessonEngine.LessonEngine;
const topic = { id: "fractions", title: "Fractions", storageNamespace: "fractions" };

check("legacy FRA24 persistence migrates to HOOK while preserving safe preferences", () => {
  localStorage.clear();
  const storageKey = "revily.fractions.FRA-24.current.v1";
  localStorage.setItem(storageKey, JSON.stringify({
    version: 1,
    contentVersion: "legacy-fra24-yaml",
    topicId: "fractions",
    skillId: "FRA-24",
    attemptId: "fra24-legacy-attempt",
    status: "SECURE",
    cursor: "D01",
    drafts: { old: "stale" },
    submissions: { old: [{ response: "stale" }] },
    exit: { result: "SECURE" },
    soundOn: false,
    developerOpen: true
  }));
  const migrated = new LessonEngine({}, spec, {}, { topic, speechSynthesis: null });
  assert.equal(migrated.state.cursor, "HOOK");
  assert.equal(migrated.state.contentVersion, "fra24-canonical-handoff-v1");
  assert.equal(migrated.state.soundOn, false);
  assert.equal(migrated.state.developerOpen, true);
  assert.deepEqual({ ...migrated.state.drafts }, {});
  assert.deepEqual({ ...migrated.state.submissions }, {});
  assert.equal(migrated.state.contentMigration.from, "legacy-fra24-yaml");
  const history = JSON.parse(localStorage.getItem("revily.fractions.FRA-24.history.v1"));
  assert.equal(history.at(-1).attemptId, "fra24-legacy-attempt");
  assert.equal(history.at(-1).completionResult, "SECURE");
});

check("canonical FRA24 state resumes drafts, pending confirmation and narration", () => {
  localStorage.clear();
  const seed = new LessonEngine({}, spec, {}, { topic, speechSynthesis: null });
  const resumable = seed.freshState();
  resumable.started = true;
  resumable.cursor = "FRESH:FRA-24-C-CONTEXT";
  resumable.drafts["FRA-24-C-CONTEXT"] = { n: "6", d: "20" };
  resumable.evidence.hintOpened["FRA-24-I1"] = true;
  resumable.evidence.pendingNoHintConfirmations = ["FRA-24-C-CONTEXT"];
  resumable.narrationResume = { active: true, cursor: "I1", utteranceIds: ["I1.PRE"], index: 0, elapsedMs: 420, action: null };
  localStorage.setItem("revily.fractions.FRA-24.current.v1", JSON.stringify(resumable));
  const resumed = new LessonEngine({}, spec, {}, { topic, speechSynthesis: null });
  assert.equal(resumed.state.cursor, "FRESH:FRA-24-C-CONTEXT");
  assert.deepEqual({ ...resumed.state.drafts["FRA-24-C-CONTEXT"] }, { n: "6", d: "20" });
  assert.deepEqual([...resumed.state.evidence.pendingNoHintConfirmations], ["FRA-24-C-CONTEXT"]);
  assert.equal(resumed.state.narrationResume.utteranceIds[0], "I1.PRE");
});

check("engine adaptive hook is property-gated to FRA24 and retains F2", () => {
  const harness = Object.create(LessonEngine.prototype);
  harness.spec = spec;
  harness.model = model;
  harness.emit = () => {};
  harness.state = new LessonEngine({}, spec, {}, { topic, speechSynthesis: null }).freshState();
  for (const id of ["G1", "G2"]) {
    harness.state.evidence.firstAttemptCorrect[`FRA-24-${id}`] = true;
    harness.state.attempts[`FRA-24-${id}`] = 1;
  }
  assert.equal(harness.adaptiveNextId(model.getNode("G2")), "F2");
  harness.state.evidence.supportEscalated["FRA-24-G2"] = true;
  assert.equal(harness.adaptiveNextId(model.getNode("G2")), "F1");
});

check("active route loads all FRA24 assets and only FRA24 receives the adapter", () => {
  const html = fs.readFileSync(path.join(fractionsDir, "index.html"), "utf8");
  for (const asset of ["fra24-approved-spec.js", "fra24-canonical.js", "fra24-visuals.js"]) assert.ok(html.includes(asset), asset);
  const loader = fs.readFileSync(path.join(fractionsDir, "js", "skill-loader.js"), "utf8");
  assert.match(loader, /normalisedId === "FRA-24"/);
  assert.match(loader, /RevilyFra24Canonical\.apply/);
  assert.ok(fs.readFileSync(path.join(fractionsDir, "js", "lesson-model.js"), "utf8").includes('model.context === "fra24"'));
  assert.ok(fs.readFileSync(path.join(fractionsDir, "js", "visual-primitives.js"), "utf8").includes('primitive === "fra24_context"'));
});

check("source and hosted mirrors are byte-identical", () => {
  for (const relative of [
    "index.html",
    "styles.css",
    "js/skill-loader.js",
    "js/lesson-model.js",
    "js/lesson-engine.js",
    "js/visual-primitives.js",
    "js/fra24-approved-spec.js",
    "js/fra24-canonical.js",
    "js/fra24-visuals.js"
  ]) {
    const source = fs.readFileSync(path.join(fractionsDir, relative));
    const mirror = fs.readFileSync(path.join(workspaceRoot, "revily-site", "public", "fractions", relative));
    assert.equal(source.equals(mirror), true, relative);
  }
});

console.log(`\nFRA24 owner-approved contract suite passed: ${checks} checks, 2,000 deterministic recovery seeds.`);
