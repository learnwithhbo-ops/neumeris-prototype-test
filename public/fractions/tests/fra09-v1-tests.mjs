import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fractionsDir = path.resolve(testDir, "..");
const workspaceRoot = path.resolve(fractionsDir, "..");
const nodeModules = path.join(workspaceRoot, "revily-site", "node_modules");
const yamlModule = await import(pathToFileURL(path.join(nodeModules, "js-yaml", "index.js")).href);

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const localStorage = new MemoryStorage();
const windowObject = {
  localStorage,
  location: { search: "" },
  crypto: { randomUUID: () => "fra09-test-attempt" },
  RevilyTopics: { all: [{ id: "fractions", title: "Fractions", storageNamespace: "fractions", skillIdPattern: "^FRA-" }] },
  RevilyVisuals: { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render() {} },
  RevilyNarrationSync: { NarrationSync: class { stop() {} } },
  setTimeout,
  clearTimeout
};
windowObject.window = windowObject;
const context = vm.createContext({
  window: windowObject,
  localStorage,
  document: { addEventListener() {}, removeEventListener() {}, hidden: false, body: { contains: () => false } },
  URLSearchParams,
  CustomEvent: class {},
  console,
  setTimeout,
  clearTimeout,
  structuredClone
});

function load(relativePath) {
  const filePath = path.join(fractionsDir, relativePath);
  new vm.Script(fs.readFileSync(filePath, "utf8"), { filename: filePath }).runInContext(context);
}

load("js/fra09-approved-spec.js");
load("js/fra09-canonical.js");
load("js/validators.js");
load("js/lesson-model.js");
load("js/lesson-engine.js");

const approved = windowObject.RevilyFra09Approved;
const runtime = windowObject.FRA09_RUNTIME_COPY;
const canonical = windowObject.RevilyFra09Canonical;
const adapter = windowObject.RevilyFra09Adapter;
assert.equal(Object.keys(runtime).length, 185, "runtime registry must contain all 185 approved utterances");
assert.equal(adapter.validateRuntimeContract().length, 0, "runtime/caption/cue contract must pass");
assert.equal(new Set(Object.values(runtime).map((entry) => entry.text.toLowerCase())).size, 185, "runtime speech must not repeat semantically identical copy");
for (const entry of Object.values(runtime)) assert.equal(entry.captionSource, "same_as_audio", "caption must use the active utterance text");

for (const scene of approved.teachingScenes) {
  for (const cue of scene.timelineCues) {
    assert.ok(runtime[cue.utteranceId], `${scene.id} cue references a missing utterance`);
    assert.ok(runtime[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()), `${scene.id} cue anchor is absent from its utterance`);
  }
}

const yamlPath = path.join(workspaceRoot, "FRA 01 to 28", "revily_fractions_v1_2", "skills", "FRA-09_COMPLETE_v1.2.yaml");
const baseSpec = yamlModule.load(fs.readFileSync(yamlPath, "utf8"));
const spec = adapter.apply(baseSpec);
const model = windowObject.RevilyLessonModel.buildLessonModel(spec);
assert.equal(spec.canonical_lesson.version, "fra09-canonical-handoff-v1");
assert.equal(spec.canonical_lesson.engine_profile, "fra09");
assert.equal(spec.diagnostic.question_refs.length, 0, "FRA09 must not add a Diagnostic layer");
assert.equal(spec.retrieval_practice.enabled, false, "FRA09 must not add a Retrieval layer");
assert.equal(model.nodes.map((node) => node.id).join("|"), ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF", "G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4"].join("|"));
assert.equal(model.exitIds.join("|"), ["FRA-09-M1", "FRA-09-M2", "FRA-09-M3", "FRA-09-M4"].join("|"));
assert.equal(model.getNode("HANDOFF").nextId, "G1");
assert.equal(model.getNode("F2").nextId, "I1");

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const speakable = [];
for (const step of spec.lesson.teaching_steps) speakable.push(...step.narration.script);
for (const step of Object.values(spec.lesson.transfer_steps)) speakable.push(...(Array.isArray(step.pre_question_script) ? step.pre_question_script : [step.pre_question_script]));
speakable.push(...spec.lesson.exit.intro_script, ...spec.completion.secure.ryan_script);
for (const question of spec.question_bank) {
  for (const [key, value] of Object.entries(question.scripts || {})) {
    if (["worked_explanation", "response_feedback", "family_feedback", "error_family_feedback"].includes(key)) continue;
    if (Array.isArray(value)) speakable.push(...value);
    else if (typeof value === "string") speakable.push(value);
  }
  Object.values(question.scripts?.error_family_feedback || {}).forEach((line) => speakable.push(line));
}
assert.ok(speakable.filter(Boolean).every((line) => runtimeTexts.has(line)), "every Ryan line must come from FRA09_RUNTIME_COPY");
assert.ok(!runtimeTexts.has(spec.question_bank.find((question) => question.id === "FRA-09-G1").prompt), "question prompts must not become runtime narration");

for (const question of approved.questions) {
  const correctResponse = question.response.kind === "fraction_pair"
    ? question.answer
    : question.response.kind === "integer"
      ? question.answer
      : question.answer;
  const correctEvaluation = canonical.evaluateQuestionResponse(question.id, correctResponse);
  assert.equal(correctEvaluation.correct, true, `${question.id} canonical answer must evaluate correct`);
  assert.equal(canonical.selectOutcomeUtteranceIds({ questionId: question.id, evaluation: correctEvaluation }).join("|"), [...question.feedback.correctUtteranceIds].join("|"));
  const wrongResponse = question.response.kind === "fraction_pair"
    ? question.visual.originalFraction
    : question.response.kind === "integer"
      ? Number(question.answer) + 1
      : question.learnerUI.options.find((option) => option.id !== question.answer).id;
  const wrongEvaluation = canonical.evaluateQuestionResponse(question.id, wrongResponse);
  assert.equal(wrongEvaluation.correct, false, `${question.id} wrong answer must evaluate incorrect before feedback`);
  const wrongIds = canonical.selectOutcomeUtteranceIds({ questionId: question.id, evaluation: wrongEvaluation });
  const expectedSpecific = wrongEvaluation.errorFamily ? question.feedback.errorSpecificUtteranceIds?.[wrongEvaluation.errorFamily] : null;
  assert.equal(wrongIds.join("|"), [...(expectedSpecific?.length ? expectedSpecific : question.feedback.incorrectDefaultUtteranceIds)].join("|"), `${question.id} must select exactly one incorrect outcome branch`);
  assert.notEqual(wrongIds.join("|"), [...question.feedback.correctUtteranceIds].join("|"), `${question.id} wrong answer must never select correct feedback`);
}

assert.equal(canonical.classifyDirectFractionResponse({ original: { numerator: 20, denominator: 30 }, factor: 5, submitted: { numerator: 2, denominator: 3 } }).errorFamily, "SKIPS_STEP");
assert.equal(canonical.classifyDirectFractionResponse({ original: { numerator: 16, denominator: 24 }, factor: 4, submitted: { numerator: 4, denominator: 24 } }).errorFamily, "TOP_ONLY");
assert.equal(canonical.classifyDirectFractionResponse({ original: { numerator: 16, denominator: 24 }, factor: 4, submitted: { numerator: 12, denominator: 20 } }).errorFamily, "SUBTRACT");
assert.equal(canonical.routeFinalCheck({ correctCount: 3, distinctFamiliesCorrect: 2, repeatedCentralMisconception: false }), "finish_candidate");
assert.equal(canonical.routeFinalCheck({ correctCount: 2, distinctFamiliesCorrect: 2, repeatedCentralMisconception: false }), "targeted_repair_then_two_item_check");
assert.equal(canonical.routeFinalCheck({ correctCount: 1, distinctFamiliesCorrect: 1, repeatedCentralMisconception: false }), "targeted_repair_then_fresh_final");
assert.equal(canonical.routeFinalCheck({ correctCount: 3, distinctFamiliesCorrect: 2, repeatedCentralMisconception: true }), "targeted_repair_then_fresh_final");

for (const id of ["M1", "M2", "M3", "M4", "RF1", "RF2", "RF3", "RF4"]) {
  const question = spec.question_bank.find((item) => item.id === `FRA-09-${id}`);
  assert.equal(question.policy.hintPolicy, "none", `${id} must have no hint`);
  assert.equal(question.policy.answerLocksOnSubmit, true, `${id} must lock on submit`);
  assert.equal(question.policy.solutionPolicy, "after_locked_submit", `${id} working must stay hidden before lock`);
  assert.notEqual(question.model.showWorkingBeforeSubmit, true, `${id} must not reveal working before submit`);
  assert.notEqual(question.model.showDivisionResultsBeforeSubmit, true, `${id} must not reveal division results before submit`);
  assert.notEqual(question.model.showCorrectionBeforeSubmit, true, `${id} must not reveal a correction before submit`);
}
assert.equal(JSON.stringify(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question), JSON.stringify({
  "FRA-09-F1": "FRA-09-C-DIRECT",
  "FRA-09-F2": "FRA-09-MC-FORM",
  "FRA-09-I1": "FRA-09-C1",
  "FRA-09-I2": "FRA-09-C2"
}));
assert.equal(spec.lesson.exit.fra09_recovery.freshFinalIds.join("|"), ["RF1", "RF2", "RF3", "RF4"].map((id) => `FRA-09-${id}`).join("|"));
assert.equal(adapter.chooseMiniChecks(["FRA-09-M1", "FRA-09-M2"], spec.question_bank).length, 2);
assert.equal(new Set(adapter.chooseMiniChecks(["FRA-09-M1", "FRA-09-M2"], spec.question_bank)).size, 2);
assert.deepEqual([...adapter.chooseMiniChecks(["FRA-09-M1", "FRA-09-M3"], spec.question_bank)], ["FRA-09-MC-DIRECT", "FRA-09-MC-FACTOR"], "mini-checks must sample each missed evidence family");
const formCheck = spec.question_bank.find((item) => item.id === "FRA-09-MC-FORM");
assert.ok(formCheck.scripts.worked_explanation.includes("6/10"), "form mini-check working must explain its own correct answer");

const css = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
assert.match(css, /@media\s*\(max-width:\s*520px\)/, "FRA09 must retain its narrow-screen layout");
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, "FRA09 must honor reduced motion");
assert.match(css, /\.fra09-question \.student-result\s*\{\s*color:\s*#b84c46;\s*\}/, "incorrect student work must remain visually identified by colour");
assert.doesNotMatch(css, /\.fra09-question \.student-result\s*\{[^}]*text-decoration/i, "incorrect student work must not use a scribbled or wavy underline");

const root = {};
const engine = new windowObject.RevilyLessonEngine.LessonEngine(root, spec, { reaction_bank: [] }, { speechSynthesis: null });
engine.state.evidence.firstAttemptCorrect["FRA-09-G1"] = true;
engine.state.evidence.firstAttemptCorrect["FRA-09-G2"] = true;
assert.equal(engine.adaptiveNextId(model.getNode("G2")), "F2", "strong guided evidence may skip F1");
engine.state.evidence.supportEscalated["FRA-09-G2"] = true;
assert.equal(engine.adaptiveNextId(model.getNode("G2")), "F1", "support escalation must retain F1");
assert.equal(model.getNode("F1").nextId, "F2", "F2 is never skipped");
engine.state.seenConfirmations = ["FRA-09-MC-FORM"];
engine.state.attempts["FRA-09-MC-FORM"] = 1;
engine.beginFra09ExitRecovery(["FRA-09-M1", "FRA-09-M3"], "targeted_two");
assert.ok(!engine.state.exit.remediation.freshSequence.includes("FRA-09-MC-FORM"), "exit recovery must not reuse an attempted mini-check");
assert.ok(engine.state.exit.remediation.freshSequence.includes("FRA-09-MC-DIRECT"), "exit recovery must retain a fresh direct-operation check");
assert.ok(engine.state.exit.remediation.freshSequence.includes("FRA-09-MC-FACTOR"), "exit recovery must retain a fresh factor-validity check");

localStorage.clear();
localStorage.setItem("revily.fractions.FRA-09.current.v1", JSON.stringify({
  version: 1,
  contentVersion: null,
  topicId: "fractions",
  skillId: "FRA-09",
  attemptId: "legacy-attempt",
  status: "SECURE",
  cursor: "M4",
  soundOn: false,
  drafts: { "FRA-09-M4": "legacy" },
  submissions: { "FRA-09-M4": [{ response: "legacy" }] }
}));
const migrated = new windowObject.RevilyLessonEngine.LessonEngine(root, spec, { reaction_bank: [] }, { speechSynthesis: null });
assert.equal(migrated.state.contentVersion, "fra09-canonical-handoff-v1");
assert.equal(migrated.state.cursor, "HOOK");
assert.equal(migrated.state.soundOn, false);
assert.equal(Object.keys(migrated.state.drafts).length, 0);
assert.equal(migrated.state.status, "LEARNING", "legacy completion must not count as canonical mastery");
const history = JSON.parse(localStorage.getItem("revily.fractions.FRA-09.history.v1"));
assert.equal(history.at(-1).reason, "content_version_migration");
assert.equal(history.at(-1).status, "SECURE");

console.log("FRA09 canonical tests passed: runtime parity, outcomes, route, recovery, leakage, answer lock, and migration.");
