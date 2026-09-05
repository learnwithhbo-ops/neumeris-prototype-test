import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(here, "../..");
const require = createRequire(import.meta.url);
const ts = require(path.join(workspace, "revily-site/node_modules/typescript/lib/typescript.js"));
const yaml = require(path.join(workspace, "revily-site/node_modules/js-yaml"));
const plain = (value) => JSON.parse(JSON.stringify(value));
let checks = 0;

function check(name, fn) {
  fn();
  checks += 1;
  console.log(`PASS ${String(checks).padStart(2, "0")} ${name}`);
}

function compileApprovedSource() {
  const specPath = path.join(workspace, ".codex-fra22-handoff/FRA22_CANONICAL_SPEC.ts");
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

const ownerSource = compileApprovedSource();
const context = { window: {}, console };
vm.createContext(context);
for (const relative of [
  "fractions/js/fra22-approved-spec.js",
  "fractions/js/fra22-canonical.js",
  "fractions/js/fra22-visuals.js",
  "fractions/js/lesson-model.js"
]) {
  const filename = path.join(workspace, relative);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
}

const browserSource = context.window.RevilyFra22Source;
const adapter = context.window.RevilyFra22Canonical;
const visuals = context.window.RevilyFra22Visuals;
const legacy = yaml.load(fs.readFileSync(path.join(workspace, "FRA 01 to 28/revily_fractions_v1_2/skills/FRA-22_COMPLETE_v1.2.yaml"), "utf8"));
const spec = adapter.apply(structuredClone(legacy));
const model = context.window.RevilyLessonModel.buildLessonModel(spec);
const question = (id) => spec.question_bank.find((item) => item.canonicalQuestionId === id);

function buildEngineHarness(savedState = null) {
  const storage = {
    values: new Map(),
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
    setItem(key, value) { this.values.set(key, String(value)); },
    removeItem(key) { this.values.delete(key); }
  };
  if (savedState) storage.setItem("revily.fractions.FRA-22.current.v1", JSON.stringify(savedState));
  const engineWindow = {
    location: { search: "" },
    crypto: { randomUUID: () => "fra22-engine-test" },
    speechSynthesis: null,
    RevilyTopics: { all: [{ id: "fractions", title: "Fractions", storageNamespace: "fractions", skillIdPattern: "^FRA-" }] },
    RevilyValidators: { serialiseResponse: (value) => value, validate: () => ({ valid: true }) },
    RevilyVisuals: { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: () => "", render() {} },
    RevilyNarrationSync: { NarrationSync: class { stop() {} start() {} } },
    RevilyNarrationAssets: { tracks: {} }
  };
  engineWindow.window = engineWindow;
  const engineContext = vm.createContext({
    window: engineWindow,
    localStorage: storage,
    document: { hidden: false, addEventListener() {}, removeEventListener() {}, createElement: () => ({}) },
    URLSearchParams,
    CustomEvent: class {},
    console,
    setTimeout,
    clearTimeout,
    structuredClone,
    Uint32Array,
    Date,
    Math
  });
  ["fra22-approved-spec.js", "fra22-canonical.js", "lesson-model.js", "lesson-engine.js"].forEach((filename) => {
    const fullPath = path.join(workspace, "fractions/js", filename);
    vm.runInContext(fs.readFileSync(fullPath, "utf8"), engineContext, { filename: fullPath });
  });
  const engineSpec = engineWindow.RevilyFra22Canonical.apply(structuredClone(legacy));
  const callbacks = {
    topic: { id: "fractions", title: "Fractions", storageNamespace: "fractions" },
    speechSynthesis: null,
    createUtterance: (text) => ({ text }),
    createAudio: () => ({})
  };
  const engine = new engineWindow.RevilyLessonEngine.LessonEngine({}, engineSpec, {}, callbacks);
  engine.emit = () => {};
  return { engine, storage };
}

function canonicalCorrect(item) {
  if (item.answer.kind === "fraction_value") return plain(item.answer.value);
  if (item.answer.kind === "integer") return item.answer.value;
  if (item.answer.kind === "option") return item.answer.optionId;
  return plain(item.answer.fields);
}

function canonicalWrong(item) {
  if (item.answer.kind === "fraction_value") return { numerator: 0, denominator: 1 };
  if (item.answer.kind === "integer") return item.answer.value + 1;
  if (item.answer.kind === "option") return item.options.find((option) => option.id !== item.answer.optionId).id;
  return Object.fromEntries(Object.keys(item.answer.fields).map((id) => [id, 999]));
}

function adapterCorrect(item) {
  const converted = question(item.id);
  if (item.answer.kind === "fraction_value") return { n: String(item.answer.value.numerator), d: String(item.answer.value.denominator) };
  if (item.answer.kind === "integer") return String(item.answer.value);
  if (item.answer.kind === "option") return Object.entries(converted.response.optionIds).find(([, id]) => id === item.answer.optionId)[0];
  if (item.answer.kind === "fields") return Object.fromEntries(Object.entries(item.answer.fields).map(([id, value]) => [id, String(value)]));
  if (item.answer.kind === "compound") return { choice: item.answer.fields.selectedOrder, whole: String(item.answer.fields.resultNumerator) };
  throw new Error(`${item.id}: unsupported answer`);
}

function evidence(id, correct, family) {
  const item = ownerSource.getQuestion(id);
  return {
    questionId: id,
    stage: item.stage,
    firstAttemptCorrect: correct,
    attempts: 1,
    hintOpenedBeforeSubmit: false,
    supportEscalated: false,
    answerLocked: true,
    countsAsIndependentEvidence: true,
    countsAsFreshEvidence: true,
    canonicalSignature: item.canonicalSignature,
    errorFamily: correct ? undefined : family,
    errorConfidence: family ? "high" : undefined,
    contentVersion: ownerSource.FRA22_CONTENT_VERSION
  };
}

check("owner TypeScript compiles and validates", () => assert.deepEqual(plain(ownerSource.validateFRA22Spec()), []));
check("browser artifact preserves the owner data exactly", () => {
  assert.deepEqual(plain(browserSource.FRA22), plain(ownerSource.FRA22));
  assert.deepEqual(plain(browserSource.FRA22_RUNTIME_COPY), plain(ownerSource.FRA22_RUNTIME_COPY));
  assert.deepEqual(plain(browserSource.FRA22_TIMELINE_CUES), plain(ownerSource.FRA22_TIMELINE_CUES));
  assert.deepEqual(plain(browserSource.FRA22_QUESTIONS), plain(ownerSource.FRA22_QUESTIONS));
  assert.deepEqual(plain(browserSource.FRA22_REPAIRS), plain(ownerSource.FRA22_REPAIRS));
});
check("content identity is the authorised FRA22 v1 contract", () => {
  assert.equal(spec.identity.id, "FRA-22");
  assert.equal(spec.identity.title, "Subtract Fractions with Different Denominators");
  assert.equal(spec.canonical_lesson.version, "fra22-unlike-denominator-subtraction-v1");
  assert.equal(spec.identity.status, "OWNER_AUTHORISED_CODEX_HANDOFF_V1");
});
check("Diagnostic and Retrieval remain out of scope", () => {
  assert.equal(spec.diagnostic.enabled, false);
  assert.equal(spec.retrieval_practice.enabled, false);
  assert.deepEqual(plain(spec.diagnostic.question_refs), []);
  assert.deepEqual(plain(spec.retrieval_practice.question_refs), []);
});
check("route is HOOK through five-item final with no legacy practice", () => {
  assert.deepEqual(plain(model.nodes.map((node) => node.id)), ["HOOK", "T1", "T2", "T3", "T4", "T5", "HANDOFF", "G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"]);
  assert.deepEqual(plain(spec.lesson.practice.question_order), []);
});
check("all 24 canonical scored questions and five repairs are present once", () => {
  assert.equal(ownerSource.FRA22_QUESTIONS.length, 24);
  assert.equal(spec.question_bank.length, 29);
  assert.equal(new Set(spec.question_bank.map((item) => item.id)).size, 29);
  ownerSource.FRA22_QUESTIONS.forEach((item) => assert.ok(question(item.id), item.id));
});
check("every canonical question accepts its exact authorised answer", () => ownerSource.FRA22_QUESTIONS.forEach((item) => assert.equal(ownerSource.evaluateQuestionAnswer(item.id, canonicalCorrect(item)), true, item.id)));
check("every canonical question rejects a deliberately wrong answer", () => ownerSource.FRA22_QUESTIONS.forEach((item) => assert.equal(ownerSource.evaluateQuestionAnswer(item.id, canonicalWrong(item)), false, item.id)));
check("adapter preserves correctness for every response control", () => ownerSource.FRA22_QUESTIONS.forEach((item) => assert.equal(adapter.evaluateResponse(question(item.id), adapterCorrect(item)).correct, true, item.id)));
check("exact equivalent fractions are accepted only on value questions", () => {
  assert.equal(adapter.evaluateResponse(question("I1"), { n: "26", d: "60" }).correct, true);
  assert.equal(adapter.evaluateResponse(question("M3"), { leftEquivalentNumerator: "42", resultNumerator: "32" }).correct, false);
});
check("G1 and G2 expose distinct authored response branches", () => {
  assert.equal(adapter.visibleFeedback(question("G1"), "12", false, 1), ownerSource.FRA22_RUNTIME_COPY["G1.INCORRECT.12"].text);
  assert.equal(adapter.visibleFeedback(question("G2"), { leftEquivalentNumerator: "11", rightEquivalentNumerator: "5", resultNumerator: "6" }, false, 1), ownerSource.FRA22_RUNTIME_COPY["G2.INCORRECT.LEFT"].text);
  assert.deepEqual(plain(adapter.selectOutcomeUtteranceIds(question("G2"), { leftEquivalentNumerator: "12", rightEquivalentNumerator: "5", resultNumerator: "17" }, false, 1)), ["G2.INCORRECT.ADD"]);
});
check("high-confidence error families classify from visible structure", () => {
  assert.deepEqual(plain(adapter.evaluateResponse(question("F2"), "(7 - 2) / (8 - 3) = 5/5")).errorFamily, "DIRECT");
  assert.equal(adapter.evaluateResponse(question("G2"), { leftEquivalentNumerator: "11", rightEquivalentNumerator: "5", resultNumerator: "6" }).errorFamily, "SCALE");
  assert.equal(adapter.evaluateResponse(question("M5"), "5/20 - 14/20 = 9/20").errorFamily, "ORDER");
  assert.equal(adapter.evaluateResponse(question("M5"), "14/20 - 5/20 = 9/40").errorFamily, "DEN_KEEP");
  assert.equal(adapter.evaluateResponse(question("G1"), "12").errorFamily, "COMMON");
  assert.equal(adapter.evaluateResponse(question("G2"), { leftEquivalentNumerator: "12", rightEquivalentNumerator: "5", resultNumerator: "6" }).errorFamily, "ARITHMETIC");
});
check("all 57 Ryan lines and 24 cue anchors are exact", () => {
  assert.equal(Object.keys(ownerSource.FRA22_RUNTIME_COPY).length, 57);
  assert.equal(ownerSource.FRA22_TIMELINE_CUES.length, 24);
  ownerSource.FRA22_TIMELINE_CUES.forEach((cue) => {
    const utterance = ownerSource.FRA22_RUNTIME_COPY[cue.utteranceId];
    assert.ok(utterance, cue.id);
    assert.ok(utterance.text.toLowerCase().includes(cue.anchorText.toLowerCase()), cue.id);
    assert.equal(cue.mustNotOccurBeforeAnchor, true, cue.id);
    assert.ok(cue.reducedMotionState.trim(), cue.id);
  });
});
check("runtime narration contains only registered Ryan text", () => {
  const registered = new Set(Object.values(ownerSource.FRA22_RUNTIME_COPY).map((entry) => entry.text));
  spec.lesson.teaching_steps.flatMap((step) => step.narration.script).forEach((line) => assert.ok(registered.has(line), line));
  spec.question_bank.flatMap((item) => item.runtimeUtteranceIds || []).forEach((id) => assert.ok(ownerSource.FRA22_RUNTIME_COPY[id], id));
  ownerSource.FRA22_QUESTIONS.filter((item) => item.hint).forEach((item) => assert.ok(!registered.has(item.hint.visibleText), item.id));
});
check("caption and live Ryan workflow are configured together", () => {
  assert.equal(spec.voice_and_script.narration_playback.mode, "browser_speech_ryan");
  assert.equal(spec.voice_and_script.narration_playback.require_ryan_voice, true);
  assert.equal(spec.voice_and_script.caption_presentation.mode, "on_canvas_progressive");
  assert.equal(spec.voice_and_script.caption_presentation.transcript_bar, false);
});
check("strong guided evidence skips F1 only", () => {
  const clean = (id) => ({ ...evidence(id, true), answerLocked: false });
  assert.equal(ownerSource.shouldSkipF1(clean("G1"), clean("G2")), true);
  assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
  assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1");
});
check("any miss, hint, retry, or support blocks the fast route", () => {
  const base = [evidence("G1", true), evidence("G2", true)];
  for (const mutate of [
    (records) => { records[0].firstAttemptCorrect = false; },
    (records) => { records[0].hintOpenedBeforeSubmit = true; },
    (records) => { records[1].attempts = 2; },
    (records) => { records[1].supportEscalated = true; }
  ]) {
    const records = structuredClone(base);
    mutate(records);
    assert.equal(ownerSource.shouldSkipF1(records[0], records[1]), false);
  }
});
check("engine executes the clean gate, hint confirmation, and content migration", () => {
  const { engine } = buildEngineHarness();
  engine.state = engine.freshState();
  ["FRA-22-G1", "FRA-22-G2"].forEach((id) => {
    engine.state.attempts[id] = 1;
    engine.state.evidence.firstAttemptCorrect[id] = true;
    engine.state.resolved[id] = "correct";
  });
  assert.equal(engine.adaptiveNextId(engine.model.getNode("G2")), "F2");
  engine.state.evidence.hintOpenedBeforeSubmit["FRA-22-G1"] = true;
  assert.equal(engine.adaptiveNextId(engine.model.getNode("G2")), "F1");
  engine.state.evidence.pendingNoHintConfirmations = ["FRA-22-C-METHOD"];
  assert.equal(engine.adaptiveNextId(engine.model.getNode("I2")), "FRESH:FRA-22-C-METHOD");
  engine.state.cursor = "M3";
  engine.state.submissions = { "FRA-22-M1": [{ response: "old" }] };
  engine.render = () => {};
  engine.persist = () => {};
  engine.startAgain();
  assert.equal(engine.state.cursor, "HOOK");
  assert.equal(engine.state.started, true);
  assert.deepEqual(plain(engine.state.submissions), {});

  const saved = {
    version: 1,
    contentVersion: "legacy-fra22-yaml",
    topicId: "fractions",
    skillId: "FRA-22",
    attemptId: "legacy-attempt",
    cursor: "F2",
    status: "LEARNING",
    soundOn: false,
    developerOpen: true,
    submissions: { legacy: [{ response: "old" }] },
    exit: { result: null }
  };
  const migrated = buildEngineHarness(saved);
  assert.equal(migrated.engine.state.cursor, "HOOK");
  assert.equal(migrated.engine.state.soundOn, false);
  assert.equal(migrated.engine.state.developerOpen, true);
  assert.deepEqual(plain(migrated.engine.state.submissions), {});
  const history = JSON.parse(migrated.storage.getItem("revily.fractions.FRA-22.history.v1"));
  assert.equal(history[0].pathwayOrigin, "F2");
});
check("all optional hints queue the authorised same-family confirmation", () => assert.deepEqual(plain(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question), {
  "FRA-22-F1": "FRA-22-C-DIRECT",
  "FRA-22-F2": "FRA-22-C-METHOD",
  "FRA-22-I1": "FRA-22-C-DIRECT",
  "FRA-22-I2": "FRA-22-C-CONTEXT"
}));
check("all five central repairs contain explanation, supported work, and fresh preferences", () => Object.values(ownerSource.FRA22_REPAIRS).forEach((repair) => {
  const intro = question(adapter.unprefix(adapter.repairByFamily[repair.errorFamily]));
  assert.ok(intro, repair.errorFamily);
  assert.equal(intro.supportedInteractionId, `FRA-22-${repair.supportedQuestionId}`);
  assert.ok(question(repair.supportedQuestionId));
  assert.ok(repair.freshQuestionPreference.length >= 2);
}));
check("mathematical freshness catches the two authorised duplicate pairs", () => {
  assert.equal(ownerSource.getQuestionFreshnessSignature("R-DIRECT-F"), ownerSource.getQuestionFreshnessSignature("M1"));
  assert.equal(ownerSource.getQuestionFreshnessSignature("C-DIRECT"), ownerSource.getQuestionFreshnessSignature("R-ORDER-F"));
  assert.notEqual(ownerSource.getQuestionFreshnessSignature("C-METHOD"), ownerSource.getQuestionFreshnessSignature("M1"));
});
check("fresh selector rejects seen IDs and ordered-subtraction signatures", () => {
  const state = { seenConfirmations: [], evidence: { freshnessSignature: { "FRA-22-M1": ownerSource.getQuestionFreshnessSignature("M1") } } };
  const selected = adapter.selectFreshCheckId("DIRECT", state, []);
  assert.ok(selected);
  assert.notEqual(ownerSource.getQuestionFreshnessSignature(adapter.unprefix(selected)), ownerSource.getQuestionFreshnessSignature("M1"));
});
check("4/5 with direct and application evidence completes", () => {
  const records = [evidence("M1", true), evidence("M2", true), evidence("M3", true), evidence("M4", true), evidence("M5", false, "ORDER")];
  assert.equal(ownerSource.decideFinalRoute(records).kind, "complete");
});
check("3/5 routes to repair plus a fresh 2/2 mini-check", () => {
  const records = [evidence("M1", true), evidence("M2", true), evidence("M3", true), evidence("M4", false, "SCALE"), evidence("M5", false, "ORDER")];
  const decision = ownerSource.decideFinalRoute(records);
  assert.equal(decision.kind, "targeted_repair_then_two_item_check");
  assert.equal(decision.requiredFreshCount, 2);
});
check("0-2/5 routes to repair plus a fresh 3/3 final", () => {
  const records = [evidence("M1", true), evidence("M2", true), evidence("M3", false, "SCALE"), evidence("M4", false, "DIRECT"), evidence("M5", false, "ORDER")];
  const decision = ownerSource.decideFinalRoute(records);
  assert.equal(decision.kind, "targeted_repair_then_three_item_final");
  assert.equal(decision.requiredFreshCount, 3);
});
check("engine materialises all three final routes with authored recovery only", () => {
  const { engine } = buildEngineHarness();
  const seed = (correctIds, wrongFamilies) => {
    engine.state = engine.freshState();
    engine.state.exit.responses = {};
    ["M1", "M2", "M3", "M4", "M5"].forEach((rawId) => {
      const id = `FRA-22-${rawId}`;
      const correct = correctIds.includes(rawId);
      engine.state.attempts[id] = 1;
      engine.state.evidence.firstAttemptCorrect[id] = correct;
      engine.state.evidence.answerLocked[id] = true;
      engine.state.evidence.countsAsFreshEvidence[id] = true;
      engine.state.exit.responses[id] = { correct };
      if (!correct) {
        engine.state.evidence.errorFamily[id] = wrongFamilies[rawId];
        engine.state.evidence.errorConfidence[id] = "high";
      }
    });
    engine.state.exit.missedPrimaryIds = Object.keys(engine.state.exit.responses).filter((id) => !engine.state.exit.responses[id].correct);
  };

  seed(["M1", "M2", "M3", "M4"], { M5: "ORDER" });
  engine.routeFra22FinalEvidence(4, ["FRA-22-M5"]);
  assert.equal(engine.state.exit.result, "SECURE");
  assert.equal(engine.state.exit.remediation.route, "primary_mastery");

  seed(["M1", "M2", "M3"], { M4: "SCALE", M5: "ORDER" });
  engine.routeFra22FinalEvidence(3, ["FRA-22-M4", "FRA-22-M5"]);
  assert.equal(engine.state.exit.remediation.route, "targeted_repair_then_two_item_check");
  assert.equal(engine.state.exit.remediation.requiredCount, 2);
  assert.equal(engine.state.exit.remediation.recoveryIds.length, 2);
  assert.match(engine.state.cursor, /^RECOVERY:FRA-22-R-/);

  seed(["M1", "M2"], { M3: "SCALE", M4: "DIRECT", M5: "ORDER" });
  engine.routeFra22FinalEvidence(2, ["FRA-22-M3", "FRA-22-M4", "FRA-22-M5"]);
  assert.equal(engine.state.exit.remediation.route, "targeted_repair_then_three_item_final");
  assert.equal(engine.state.exit.remediation.requiredCount, 3);
  assert.equal(engine.state.exit.remediation.recoveryIds.length, 3);
  engine.state.exit.remediation.recoveryIds.forEach((id) => assert.ok(question(adapter.unprefix(id)), id));
});
check("recovery selector returns authored unique fresh mathematics", () => {
  const selection = ownerSource.selectUnusedRecoveryQuestions(3, ["DIRECT", "ORDER"], ["M1", "M2", "M3", "M4", "M5"], [
    ownerSource.getQuestionFreshnessSignature("M1"),
    ownerSource.getQuestionFreshnessSignature("M2"),
    ownerSource.getQuestionFreshnessSignature("M3"),
    ownerSource.getQuestionFreshnessSignature("M4"),
    ownerSource.getQuestionFreshnessSignature("M5")
  ]);
  assert.equal(selection.complete, true);
  assert.equal(selection.questionIds.length, 3);
  assert.equal(new Set(selection.questionIds.map((id) => ownerSource.getQuestionFreshnessSignature(id))).size, 3);
});
check("recovery pool exhaustion never generates a question", () => {
  const eligible = ownerSource.FRA22_QUESTIONS.filter((item) => item.recoveryEligible);
  const selection = ownerSource.selectUnusedRecoveryQuestions(3, [], eligible.map((item) => item.id), eligible.map((item) => ownerSource.getQuestionFreshnessSignature(item)));
  assert.equal(selection.complete, false);
  assert.deepEqual(plain(selection.questionIds), []);
  assert.match(selection.reason, /Do not generate/i);
});
check("final items lock and reveal sequential working only after submit", () => spec.lesson.exit.primary_question_refs.forEach((id) => {
  const item = spec.question_bank.find((candidate) => candidate.id === id);
  assert.equal(item.policy.answerLocksOnSubmit, true, id);
  assert.equal(item.policy.solutionPolicy, "after_locked_submit", id);
  assert.ok(item.scripts.worked_steps.length >= 3, id);
  const initial = visuals.renderMarkup(item.visual, { feedback: "initial", question: item });
  const worked = visuals.renderMarkup(item.visual, { feedback: "worked", question: item });
  assert.ok(!initial.includes("fra22-worked-steps"), id);
  assert.ok(worked.includes("fra22-worked-steps"), id);
}));
check("hook and teaching visuals preserve the storyboard objects", () => {
  const hook = visuals.renderMarkup(model.getNode("HOOK").visual, {});
  assert.ok(hook.includes("battery-sixths"));
  assert.ok(hook.includes("fra22-quarter-use"));
  assert.ok(hook.includes("fra22-wrong-method"));
  assert.ok(hook.includes("fra22-impossible-batteries"));
  const alternate = visuals.renderMarkup(model.getNode("T5").visual, {});
  assert.ok(alternate.includes("route-twelve"));
  assert.ok(alternate.includes("route-twenty-four"));
});
check("every route node has a non-empty accessible equivalent", () => model.nodes.forEach((node) => assert.ok(visuals.accessibleDescription(node.visual, { question: node.question }).trim(), node.id)));
check("active route loads all three FRA22 browser assets", () => {
  const html = fs.readFileSync(path.join(workspace, "fractions/index.html"), "utf8");
  ["fra22-approved-spec.js", "fra22-canonical.js", "fra22-visuals.js"].forEach((asset) => assert.ok(html.includes(asset), asset));
});
check("engine hooks are FRA22-gated and migrate legacy state to HOOK", () => {
  const engine = fs.readFileSync(path.join(workspace, "fractions/js/lesson-engine.js"), "utf8");
  ["isFra22V1", "fra22-unlike-denominator-subtraction-v1", "handleFra22Outcome", "routeFra22FinalEvidence", "fra22FinalRecovery", "legacy-fra22-yaml", "countsAsFreshEvidence", "freshnessSignature"].forEach((token) => assert.ok(engine.includes(token), token));
});
check("shared visual and model hooks are isolated to fra22_context", () => {
  assert.ok(fs.readFileSync(path.join(workspace, "fractions/js/visual-primitives.js"), "utf8").includes("fra22_context"));
  assert.ok(fs.readFileSync(path.join(workspace, "fractions/js/lesson-model.js"), "utf8").includes('model.context === "fra22"'));
});
check("completion does not hard-code FRA23 or a future layer", () => {
  const text = JSON.stringify({ completion: spec.completion, route: spec.canonical_lesson.route_contract });
  assert.ok(!text.includes("FRA-23"));
  assert.deepEqual(plain(spec.completion.secure.buttons), ["Back to Fractions", "Start again"]);
});

console.log(`\nFRA-22 contract suite passed: ${checks} checks.`);
