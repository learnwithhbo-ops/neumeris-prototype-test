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
const tsModule = await import(pathToFileURL(path.join(nodeModules, "typescript", "lib", "typescript.js")).href);
const ts = tsModule.default || tsModule;

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const canonicalPath = path.join(workspaceRoot, "FRA15_CANONICAL_SPEC.ts");
const canonicalSource = fs.readFileSync(canonicalPath, "utf8");
const compiled = ts.transpileModule(canonicalSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
  fileName: canonicalPath,
  reportDiagnostics: true
});
const compileErrors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.deepEqual(compileErrors, [], "FRA15 canonical TypeScript must compile without errors in the repository");
const canonicalModule = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: canonicalModule, exports: canonicalModule.exports }, { filename: canonicalPath });
assert.deepEqual([...canonicalModule.exports.validateFRA15CanonicalSpec()], [], "validateFRA15CanonicalSpec() must return no errors in the repository");

const localStorage = new MemoryStorage();
const windowObject = {
  localStorage,
  location: { search: "" },
  crypto: { randomUUID: () => "fra15-test-attempt" },
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

load("js/fra15-approved-spec.js");
load("js/fra15-canonical.js");
load("js/fra15-visuals.js");
load("js/validators.js");
load("js/lesson-model.js");
load("js/lesson-engine.js");

const approvedSource = windowObject.RevilyFra15Approved;
const runtime = windowObject.FRA15_RUNTIME_COPY;
const canonical = windowObject.RevilyFra15Canonical;
assert.equal(Object.keys(runtime).length, 152, "all 152 approved FRA15 utterances must be generated");
assert.deepEqual([...approvedSource.validateFRA15CanonicalSpec()], []);
assert.deepEqual([...canonical.validateRuntimeContract()], []);
assert.equal(JSON.stringify(runtime), JSON.stringify(canonicalModule.exports.FRA15_RUNTIME_COPY), "generated browser runtime must match the canonical TypeScript registry");
for (const [id, entry] of Object.entries(runtime)) {
  assert.equal(entry.captionSource, "same_as_audio", `${id} caption and audio must share one source`);
  assert.ok(entry.text.trim(), `${id} needs learner runtime text`);
}

for (const scene of approvedSource.FRA15_TEACHING_SCENES) {
  for (const cue of scene.timeline) {
    assert.ok(scene.ryanUtteranceIds.includes(cue.utteranceId), `${cue.id} must reference an active scene utterance`);
    assert.ok(runtime[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()), `${cue.id} anchor must be an exact phrase in ${cue.utteranceId}`);
  }
}
for (const repair of approvedSource.FRA15_REPAIR_PROFILES) {
  for (const cue of repair.timeline) {
    assert.ok(repair.ryanUtteranceIds.includes(cue.utteranceId), `${cue.id} must reference an active repair utterance`);
    assert.ok(runtime[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()), `${cue.id} anchor must be exact`);
  }
}

const yamlPath = path.join(workspaceRoot, "FRA 01 to 28", "revily_fractions_v1_2", "skills", "FRA-15_COMPLETE_v1.2.yaml");
const baseSpec = yamlModule.load(fs.readFileSync(yamlPath, "utf8"));
const spec = canonical.apply(baseSpec);
const model = windowObject.RevilyLessonModel.buildLessonModel(spec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-15-${id}`);

assert.equal(spec.canonical_lesson.version, "fra15-quantity-as-fraction-v1");
assert.equal(spec.canonical_lesson.engine_profile, "fra15");
assert.deepEqual([...spec.dependencies.required_skill_refs], ["FRA-01", "FRA-02", "FRA-10"]);
assert.deepEqual([...spec.diagnostic.question_refs], [], "FRA15 must not add Diagnostic");
assert.equal(spec.retrieval_practice.enabled, false, "FRA15 must not add Retrieval");
assert.equal(Array.from(model.nodes, (node) => node.id).join("|"), ["HOOK", "T1", "T2", "T3", "T4", "T5", "HANDOFF", "G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"].join("|"));
assert.equal(Array.from(model.exitIds).join("|"), ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-15-${id}`).join("|"));
assert.equal(model.getNode("HANDOFF").nextId, "G1");
assert.equal(model.getNode("F2").nextId, "I1", "F2 must remain on every guided route");
assert.equal(model.getNode("HOOK").source.pause_after_narration, true, "the measured-ribbon hook must pause for Show me");

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const speakable = [];
for (const step of spec.lesson.teaching_steps) speakable.push(...step.narration.script);
for (const step of Object.values(spec.lesson.transfer_steps)) speakable.push(...(Array.isArray(step.pre_question_script) ? step.pre_question_script : [step.pre_question_script]));
speakable.push(...spec.lesson.exit.intro_script, ...spec.completion.secure.ryan_script);
for (const item of spec.question_bank) {
  for (const [key, value] of Object.entries(item.scripts || {})) {
    if (key === "worked_explanation") continue;
    const lines = Array.isArray(value) ? value : [value];
    speakable.push(...lines.filter(Boolean));
  }
}
assert.ok(speakable.every((line) => runtimeTexts.has(line)), "every speakable FRA15 line must come from FRA15_RUNTIME_COPY");
assert.ok(!runtimeTexts.has(question("M1").prompt), "learner prompts must never become Ryan speech");

function evaluate(id, response) { return canonical.evaluateResponse(question(id), response); }
assert.equal(evaluate("G1", { n: "9", d: "6" }).correct, true);
assert.equal(evaluate("G1", { n: "3", d: "2" }).correct, true, "exact-equivalent forms must be accepted where approved");
assert.equal(evaluate("G1", { n: "6", d: "9" }).errorFamily, "order");
assert.deepEqual([...evaluate("G1", { n: "6", d: "9" }).utteranceIds], ["G1.INCORRECT.ORDER"]);
assert.equal(evaluate("G1", { n: "9", d: "15" }).errorFamily, "total");
assert.deepEqual([...evaluate("G1", { n: "9", d: "15" }).utteranceIds], ["G1.INCORRECT.TOTAL"]);
assert.equal(evaluate("G2", { n: "14", d: "21" }).correct, false, "raw form must fail when simplest form is required");
assert.deepEqual([...evaluate("G2", { n: "14", d: "21" }).utteranceIds], ["G2.INCORRECT.FORM"]);
assert.equal(evaluate("G2", { n: "2", d: "3" }).correct, true);
assert.equal(evaluate("F2", "7/4").correct, true);
assert.equal(evaluate("F2", "7/11").errorFamily, "total");
assert.equal(evaluate("I2", ["3/4", "4/3"]).correct, true);
assert.deepEqual([...evaluate("I2", ["4/3", "3/4"]).utteranceIds], ["I2.INCORRECT.SWAPPED"]);
assert.equal(evaluate("M4", { n: "18", d: "18" }).correct, true);
assert.equal(evaluate("M4", { n: "1", d: "1" }).correct, true);
assert.equal(evaluate("M4", { n: "36", d: "36" }).correct, false, "equal-to-one item accepts only the authored exact forms");
assert.equal(evaluate("M5", { n: "120", d: "2" }).errorFamily, "units");

for (const raw of approvedSource.allFRA15QuestionLikeObjects()) {
  const item = question(raw.id);
  assert.ok(item, `${raw.id} must be wired into the repository question bank`);
  let correctResponse;
  if (raw.answer.kind === "fraction") correctResponse = { n: String(raw.answer.canonicalFraction.numerator), d: String(raw.answer.canonicalFraction.denominator) };
  else if (raw.answer.kind === "choice") correctResponse = raw.response.options.find((option) => option.id === raw.answer.optionId).label;
  else correctResponse = (raw.visual.statements || Object.keys(raw.answer.pairs)).map((statement) => raw.answer.pairs[statement]);
  const result = canonical.evaluateResponse(item, correctResponse);
  assert.equal(result.correct, true, `${raw.id} canonical answer must evaluate correct before feedback`);
  assert.deepEqual([...result.utteranceIds], [...raw.feedback.correctUtteranceIds], `${raw.id} must select its item-specific correct branch only`);
}

for (const id of ["M1", "M2", "M3", "M4", "M5", "RF1", "RF2", "RF3", "RF4", "RF5"]) {
  const item = question(id);
  assert.equal(item.policy.hintPolicy, "none", `${id} must have no hint`);
  assert.equal(item.policy.answerLocksOnSubmit, true, `${id} must lock on submit`);
  assert.equal(item.policy.solutionPolicy, "after_locked_submit", `${id} working must follow answer lock`);
  assert.ok(item.scripts.worked_narration.length >= 2, `${id} needs item-specific worked narration`);
  assert.ok(item.scripts.worked_explanation.length > 0, `${id} needs sequential visible working`);
  assert.notEqual(item.model.visual.showRoleLabelsBeforeSubmit, true, `${id} must not pre-label fraction roles`);
}
assert.equal(new Set(["M1", "M2", "M3", "M4", "M5"].map((id) => question(id).scripts.on_correct_reaction)).size, 5, "M1-M5 correct feedback must remain item-specific");
assert.equal(new Set(["M1", "M2", "M3", "M4", "M5"].map((id) => question(id).scripts.on_incorrect_reaction)).size, 5, "M1-M5 default incorrect feedback must remain item-specific");

assert.equal(approvedSource.routeFRA15AfterGuided({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: true, hintOrSupportEscalated: false, orderCorrect: true, requestedFormMet: true, centralMisconceptionExposed: false }), "fast_skip_f1_keep_f2");
assert.equal(approvedSource.routeFRA15AfterGuided({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: true, hintOrSupportEscalated: true, orderCorrect: true, requestedFormMet: true, centralMisconceptionExposed: false }), "standard_show_f1_then_f2");
assert.equal(approvedSource.routeFRA15FinalCheck({ correctCount: 5, firstAttemptIndependentCorrectCount: 5, distinctEvidenceFamiliesCorrect: 5, repeatedBlockingMisconception: false }), "finish_candidate");
assert.equal(approvedSource.routeFRA15FinalCheck({ correctCount: 3, firstAttemptIndependentCorrectCount: 3, distinctEvidenceFamiliesCorrect: 3, repeatedBlockingMisconception: false }), "repair_missed_families_then_two_confirmations");
assert.equal(approvedSource.routeFRA15FinalCheck({ correctCount: 2, firstAttemptIndependentCorrectCount: 2, distinctEvidenceFamiliesCorrect: 2, repeatedBlockingMisconception: false }), "repair_then_fresh_final_five");
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.otherwise, "F1");
assert.deepEqual({ ...spec.lesson.adaptive_pathway.no_hint_confirmation_by_question }, {
  "FRA-15-F1": "FRA-15-C-ORDER",
  "FRA-15-F2": "FRA-15-C-TOTAL",
  "FRA-15-I1": "FRA-15-C-SMALL",
  "FRA-15-I2": "FRA-15-R-ORDER-CHECK"
});
for (const family of ["order", "total", "combine", "smallness_bias", "form", "units"]) {
  assert.ok(spec.lesson.adaptive_pathway.repair_by_error_family[family], `${family} repair must exist`);
  assert.ok(spec.lesson.adaptive_pathway.fresh_checks_by_error_family[family]?.length, `${family} repair check must exist`);
  assert.ok(spec.lesson.adaptive_pathway.confirmation_by_error_family[family], `${family} confirmation must exist`);
}
assert.equal(new Set(spec.lesson.exit.confirmation_question_refs).size, spec.lesson.exit.confirmation_question_refs.length, "confirmation and recovery IDs must be unique");

const secureRecords = ["M1", "M2", "M3", "M4", "M5"].map((id, index) => ({
  questionId: `FRA-15-${id}`,
  family: question(id).evidenceFamily,
  correct: index !== 4,
  firstAttemptCorrect: index !== 4,
  hintUsed: false,
  errorFamily: index === 4 ? "units" : null
}));
assert.equal(canonical.evaluateFinalEvidence(secureRecords).masterySatisfied, true, "4/5 clean evidence may finish");
const blockedFour = canonical.evaluateFinalEvidence(secureRecords, { repeatedBlockingFamilies: ["order"] });
assert.equal(blockedFour.masterySatisfied, false, "4/5 cannot finish with a repeated blocking family from earlier lesson evidence");
assert.equal(blockedFour.route, "repair_blocking_family_then_fresh_confirmation");
const threeRecords = secureRecords.map((record, index) => ({ ...record, correct: index < 3, firstAttemptCorrect: index < 3, errorFamily: index < 3 ? null : index === 3 ? "total" : "units" }));
assert.equal(canonical.evaluateFinalEvidence(threeRecords).route, "repair_missed_families_then_two_confirmations");

const root = {};
const engine = new windowObject.RevilyLessonEngine.LessonEngine(root, spec, { reaction_bank: [] }, { speechSynthesis: null });
engine.state.evidence.firstAttemptCorrect["FRA-15-G1"] = true;
engine.state.evidence.firstAttemptCorrect["FRA-15-G2"] = true;
assert.equal(engine.adaptiveNextId(model.getNode("G2")), "F2", "strong G1/G2 evidence skips F1");
engine.state.evidence.supportEscalated["FRA-15-G2"] = true;
assert.equal(engine.adaptiveNextId(model.getNode("G2")), "F1", "support escalation retains F1");

const routeHarness = Object.create(windowObject.RevilyLessonEngine.LessonEngine.prototype);
routeHarness.spec = spec;
routeHarness.model = model;
routeHarness.emit = () => {};
routeHarness.persist = () => {};
routeHarness.state = engine.freshState();
model.exitIds.forEach((id, index) => {
  const correct = index < 3;
  routeHarness.state.exit.responses[id] = { response: { n: "1", d: "2" }, correct };
  routeHarness.state.evidence.firstAttemptCorrect[id] = correct;
  if (!correct) routeHarness.state.evidence.errorFamily[id] = index === 3 ? "total" : "units";
});
routeHarness.state.exit.missedPrimaryIds = ["FRA-15-M4", "FRA-15-M5"];
routeHarness.routeFra15FinalEvidence(3, routeHarness.state.exit.missedPrimaryIds);
assert.equal(routeHarness.state.exit.remediation.route, "score_three_repair_then_two_confirmations");
assert.equal(routeHarness.state.exit.remediation.recoveryIds.length, 2);
assert.equal(routeHarness.state.exit.remediation.evidenceWindow.length, 5, "3/5 evidence window must be three clean originals plus two fresh confirmations");

const blockerHarness = Object.create(windowObject.RevilyLessonEngine.LessonEngine.prototype);
blockerHarness.spec = spec;
blockerHarness.model = model;
blockerHarness.emit = () => {};
blockerHarness.persist = () => {};
blockerHarness.state = engine.freshState();
model.exitIds.forEach((id, index) => {
  const correct = index < 4;
  blockerHarness.state.exit.responses[id] = { response: { n: "1", d: "2" }, correct };
  blockerHarness.state.evidence.firstAttemptCorrect[id] = correct;
  if (!correct) blockerHarness.state.evidence.errorFamily[id] = "units";
});
blockerHarness.state.evidence.candidateErrorFamily["FRA-15-G1"] = "order";
blockerHarness.state.evidence.candidateErrorFamily["FRA-15-F1"] = "order";
blockerHarness.state.exit.missedPrimaryIds = ["FRA-15-M5"];
blockerHarness.routeFra15FinalEvidence(4, blockerHarness.state.exit.missedPrimaryIds);
assert.equal(blockerHarness.state.exit.remediation.route, "blocking_family_repair_then_confirmation");
assert.deepEqual([...blockerHarness.state.exit.remediation.repairFamilies], ["order"]);
assert.deepEqual([...blockerHarness.state.exit.remediation.recoveryIds], ["FRA-15-C-ORDER"]);
assert.equal(blockerHarness.state.exit.remediation.evidenceWindow.length, 5, "blocked 4/5 must replace the blocker with one fresh family check");

const lowHarness = Object.create(windowObject.RevilyLessonEngine.LessonEngine.prototype);
lowHarness.spec = spec;
lowHarness.model = model;
lowHarness.emit = () => {};
lowHarness.persist = () => {};
lowHarness.state = engine.freshState();
model.exitIds.forEach((id, index) => {
  const correct = index < 2;
  lowHarness.state.exit.responses[id] = { response: { n: "1", d: "2" }, correct };
  lowHarness.state.evidence.firstAttemptCorrect[id] = correct;
  if (!correct) lowHarness.state.evidence.errorFamily[id] = index === 2 ? "order" : index === 3 ? "total" : "units";
});
lowHarness.state.exit.missedPrimaryIds = ["FRA-15-M3", "FRA-15-M4", "FRA-15-M5"];
lowHarness.routeFra15FinalEvidence(2, lowHarness.state.exit.missedPrimaryIds);
assert.equal(lowHarness.state.exit.remediation.route, "score_zero_to_two_repair_then_fresh_final_five");
assert.deepEqual([...lowHarness.state.exit.remediation.recoveryIds], ["RF1", "RF2", "RF3", "RF4", "RF5"].map((id) => `FRA-15-${id}`));

localStorage.clear();
localStorage.setItem("revily.fractions.FRA-15.current.v1", JSON.stringify({
  version: 1,
  contentVersion: null,
  topicId: "fractions",
  skillId: "FRA-15",
  attemptId: "legacy-fra15-attempt",
  status: "SECURE",
  cursor: "M5",
  soundOn: false,
  developerOpen: true,
  drafts: { "FRA-15-M5": { n: "legacy", d: "legacy" } },
  submissions: { "FRA-15-M5": [{ response: "legacy" }] },
  exit: { result: "SECURE" }
}));
const migrated = new windowObject.RevilyLessonEngine.LessonEngine(root, spec, { reaction_bank: [] }, { speechSynthesis: null });
assert.equal(migrated.state.contentVersion, "fra15-quantity-as-fraction-v1");
assert.equal(migrated.state.cursor, "HOOK");
assert.equal(migrated.state.soundOn, false);
assert.equal(migrated.state.developerOpen, true);
assert.equal(migrated.state.status, "LEARNING", "legacy mastery must not certify canonical FRA15");
assert.deepEqual({ ...migrated.state.drafts }, {});
const history = JSON.parse(localStorage.getItem("revily.fractions.FRA-15.history.v1"));
assert.equal(history.at(-1).reason, "content_version_migration");
assert.equal(history.at(-1).status, "SECURE");

const indexSource = fs.readFileSync(path.join(fractionsDir, "index.html"), "utf8");
assert.match(indexSource, /fra15-approved-spec\.js/);
assert.match(indexSource, /fra15-canonical\.js/);
assert.match(indexSource, /fra15-visuals\.js/);
const css = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
assert.match(css, /@media \(max-width: 520px\)[\s\S]*fra15-/);
assert.match(css, /lesson-card:has\(\.fra15-visual\)[\s\S]*canvas-narration-controls button[\s\S]*min-height:\s*44px/, "FRA15 mobile Replay and Skip controls must retain a touch-sized hit area");
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*fra15-/);
const engineSource = fs.readFileSync(path.join(fractionsDir, "js", "lesson-engine.js"), "utf8");
assert.match(engineSource, /skipNarration\(\)[\s\S]*this\.elements\.skip\.hidden = true/, "Skip must finish the caption state and remove its control");

const hostedFractionsDir = path.join(workspaceRoot, "revily-site", "public", "fractions");
for (const file of ["fra15-approved-spec.js", "fra15-canonical.js", "fra15-visuals.js"]) {
  assert.equal(
    fs.readFileSync(path.join(fractionsDir, "js", file), "utf8"),
    fs.readFileSync(path.join(hostedFractionsDir, "js", file), "utf8"),
    `${file} source and hosted mirror must match exactly`
  );
}
const hostedIndex = fs.readFileSync(path.join(hostedFractionsDir, "index.html"), "utf8");
assert.match(hostedIndex, /fra15-approved-spec\.js/);
assert.match(hostedIndex, /fra15-canonical\.js/);
assert.match(hostedIndex, /fra15-visuals\.js/);
for (const file of ["skill-loader.js", "lesson-model.js", "visual-primitives.js", "lesson-engine.js"]) {
  const hostedSource = fs.readFileSync(path.join(hostedFractionsDir, "js", file), "utf8");
  assert.match(hostedSource, /FRA-15|fra15|Fra15/, `${file} hosted mirror must contain its FRA15-gated integration`);
}
const hostedCss = fs.readFileSync(path.join(hostedFractionsDir, "styles.css"), "utf8");
assert.match(hostedCss, /@media \(max-width: 520px\)[\s\S]*fra15-/);
assert.match(hostedCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*fra15-/);

console.log("FRA15 canonical tests passed: validator, runtime parity, route, outcomes, forms, repairs, final recovery, answer lock, leakage, and migration.");
