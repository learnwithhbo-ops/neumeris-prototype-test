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
  crypto: { randomUUID: () => "fra10-test-attempt" },
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

load("js/fra10-approved-spec.js");
load("js/fra10-canonical.js");
load("js/fra10-visuals.js");
load("js/validators.js");
load("js/lesson-model.js");
load("js/lesson-engine.js");

const approved = windowObject.RevilyFra10Approved;
const adapter = windowObject.RevilyFra10Adapter;
const visuals = windowObject.RevilyFra10Visuals;
const runtime = approved.FRA10_RUNTIME_COPY;
const ui = approved.FRA10_LEARNER_UI_COPY;
const canonical = approved.FRA10;

assert.equal(Object.keys(runtime).length, 69, "FRA10 must expose all 69 approved Ryan utterances");
assert.ok(Object.keys(ui).length >= 70, "FRA10 learner UI registry is incomplete");
assert.equal(new Set(Object.keys(runtime)).size, 69, "FRA10 utterance IDs must be unique");
for (const [id, entry] of Object.entries(runtime)) {
  assert.equal(entry.spokenBy, "Ryan", `${id} must be Ryan-authored runtime copy`);
  assert.equal(entry.captionSource, "same_as_audio", `${id} captions must derive from active audio text`);
  assert.ok(entry.text.trim(), `${id} cannot be empty`);
}

for (const scene of canonical.teachingScenes) {
  for (const cue of scene.timeline || []) {
    assert.ok(runtime[cue.utteranceId], `${cue.id} references a missing utterance`);
    assert.ok(runtime[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()), `${cue.id} anchor is absent from its utterance`);
  }
}
for (const repair of canonical.repairs) {
  for (const cue of repair.timeline || []) {
    assert.ok(runtime[cue.utteranceId], `${cue.id} references a missing repair utterance`);
    assert.ok(runtime[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()), `${cue.id} repair anchor is absent from its utterance`);
  }
}

const yamlPath = path.join(workspaceRoot, "FRA 01 to 28", "revily_fractions_v1_2", "skills", "FRA-10_COMPLETE_v1.2.yaml");
const baseSpec = yamlModule.load(fs.readFileSync(yamlPath, "utf8"));
const spec = adapter.apply(baseSpec);
const model = windowObject.RevilyLessonModel.buildLessonModel(spec);

assert.equal(spec.identity.id, "FRA-10");
assert.equal(spec.canonical_lesson.version, "fra10-simplest-form-handoff-v1");
assert.equal(spec.canonical_lesson.engine_profile, "fra10");
assert.equal(spec.diagnostic.question_refs.length, 0, "FRA10 must not add a Diagnostic layer");
assert.equal(spec.retrieval_practice.enabled, false, "FRA10 must not add a Retrieval layer");
assert.equal(model.nodes.map((node) => node.id).join("|"), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "T5", "HANDOFF", "G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"].join("|"));
assert.equal(model.getNode("HOOK").nextId, "HOOK-CHOICE");
assert.equal(model.getNode("HANDOFF").nextId, "G1");
assert.equal(model.getNode("G1").nextId, "G2");
assert.equal(model.getNode("F2").nextId, "I1");
assert.equal(model.exitIds.join("|"), ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-10-${id}`).join("|"));

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const speakable = [];
for (const step of spec.lesson.teaching_steps) speakable.push(...(step.narration?.script || []));
for (const step of Object.values(spec.lesson.transfer_steps)) speakable.push(...(step.pre_question_script || []));
speakable.push(...spec.lesson.exit.intro_script, ...spec.completion.secure.ryan_script);
for (const question of spec.question_bank) {
  for (const key of ["before_submit", "hint", "reteach", "worked_narration"]) {
    const value = question.scripts?.[key];
    if (Array.isArray(value)) speakable.push(...value);
    else if (value) speakable.push(value);
  }
  for (const key of ["on_correct_reaction", "on_correct_math", "on_incorrect_reaction", "on_incorrect_attempt_1", "on_incorrect_attempt_2"]) {
    if (question.scripts?.[key]) speakable.push(question.scripts[key]);
  }
  for (const branch of Object.values(question.scripts?.engagement_response_by_value || {})) speakable.push(...branch);
}
assert.ok(speakable.filter(Boolean).every((line) => runtimeTexts.has(line)), "every automatic Ryan line must come from FRA10_RUNTIME_COPY");
assert.ok(!runtimeTexts.has(ui["G1.PROMPT"]), "a learner prompt must not enter Ryan runtime copy");
assert.ok(!runtimeTexts.has(ui["FINAL.M5.PROMPT"]), "final-context prose must not enter Ryan runtime copy");

const hook = spec.question_bank.find((item) => item.id === "FRA-10-HOOK-CHOICE");
assert.equal(hook.policy.engagementOnly, true);
assert.equal(hook.policy.scored, false);
const hookA = hook.response.options[hook.response.optionIds.indexOf("A")];
assert.equal(hook.scripts.engagement_response_by_value[hookA].join("|"), approved.getHookResponseSequence("A").map((id) => runtime[id].text).join("|"));
assert.notEqual(hook.scripts.engagement_visible_by_value[hookA], hook.scripts.engagement_response_by_value[hookA][0], "hook UI feedback must remain separate from Ryan copy");

assert.equal(approved.isSimplestForm({ numerator: 2, denominator: 3 }), true);
assert.equal(approved.isSimplestForm({ numerator: 6, denominator: 9 }), false);
assert.equal(approved.fractionsEquivalent({ numerator: 12, denominator: 18 }, { numerator: 2, denominator: 3 }), true);
assert.equal(JSON.stringify(approved.simplifyFraction({ numerator: 60, denominator: 84 })), JSON.stringify({ numerator: 5, denominator: 7 }));
assert.equal(approved.evaluateFractionResponse({ source: { numerator: 12, denominator: 18 }, response: { numerator: 6, denominator: 9 } }).family, "stop_early");
assert.equal(approved.evaluateFractionResponse({ source: { numerator: 18, denominator: 30 }, response: { numerator: 3, denominator: 30 }, methodEvidence: { changedOnlyOneSide: true } }).family, "one_side");
assert.equal(approved.evaluateFactorStep({ current: { numerator: 24, denominator: 36 }, factor: 8 }).valid, false);
assert.equal(approved.evaluateFactorStep({ current: { numerator: 24, denominator: 36 }, factor: 12 }).valid, true);

assert.equal(approved.routeGuidedGate({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: true, hintOrSupportEscalated: false, invalidFactorObserved: false, oneSideObserved: false, stopEarlyObserved: false, unresolvedCentralMisconception: false }), "fast_skip_f1_keep_f2");
assert.equal(approved.routeGuidedGate({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: true, hintOrSupportEscalated: false, invalidFactorObserved: true, oneSideObserved: false, stopEarlyObserved: false, unresolvedCentralMisconception: false }), "standard_f1_then_f2");
assert.equal(approved.routeFinalCheck({ correctCount: 4, proceduralFamilyCorrect: true, reasoningOrApplicationFamilyCorrect: true, repeatedBlockingMisconception: false }), "finish_candidate");
assert.equal(approved.routeFinalCheck({ correctCount: 3, proceduralFamilyCorrect: true, reasoningOrApplicationFamilyCorrect: true, repeatedBlockingMisconception: false }), "targeted_repair_then_two_item_check");
assert.equal(approved.routeFinalCheck({ correctCount: 2, proceduralFamilyCorrect: true, reasoningOrApplicationFamilyCorrect: false, repeatedBlockingMisconception: false }), "targeted_repair_then_three_item_final");

const getQuestion = (id) => spec.question_bank.find((item) => item.id === `FRA-10-${id}`);
assert.equal(adapter.evaluateResponse(getQuestion("G1"), { n: "3", d: "5" }).correct, true);
assert.equal(adapter.evaluateResponse(getQuestion("G1"), { n: "9", d: "15" }).errorFamily, "stop_early");
assert.equal(adapter.evaluateResponse(getQuestion("G2"), { current: { n: 3, d: 5 }, history: [{ factor: 12, after: { n: 3, d: 5 } }], finished: true }).correct, true);
assert.equal(adapter.evaluateResponse(getQuestion("G2"), { current: { n: 6, d: 10 }, history: [{ factor: 6, after: { n: 6, d: 10 } }], finished: true }).errorFamily, "stop_early");
const f2 = getQuestion("F2");
assert.equal(adapter.evaluateResponse(f2, ui["F2.OPTION.B"].text).correct, true, "F2 option B must retain its canonical option ID");
assert.equal(adapter.visibleFeedback(f2, ui["F2.OPTION.A"].text, "stop_early", false), ui["F2.WRONG.A"].text, "F2 must show the selected answer's exact feedback");
assert.equal(adapter.visibleFeedback(f2, ui["F2.OPTION.D"].text, "stop_early", false), ui["F2.WRONG.D"].text, "F2 option-specific feedback must not be overwritten by another option");

assert.equal(canonical.repairs.length, 6, "all six approved FRA10 repairs must exist");
for (const repair of canonical.repairs) {
  const question = getQuestion(repair.id);
  assert.ok(question, `${repair.id} must be available in the question bank`);
  assert.equal(question.stage, "repair");
  assert.equal(question.policy.scored, false);
  assert.ok(question.scripts.reteach.every((line) => runtimeTexts.has(line)), `${repair.id} repair speech must remain registry-bound`);
}
const early = getQuestion("R-EARLY");
assert.ok(early.response.factorOptions.includes(4), "R-EARLY must offer the approved factor 4");
assert.equal(adapter.evaluateResponse(early, { decision: ui["COMMON.DIVIDE_AGAIN"].text, factor: 4, n: "2", d: "3" }).correct, true);
const common = getQuestion("R-COMMON");
assert.equal(JSON.stringify([...common.response.factorOptions]), JSON.stringify([8, 18, 12]));
assert.equal(adapter.evaluateResponse(common, { factor: 8, n: "3", d: "4" }).errorFamily, "non_common");
assert.equal(adapter.evaluateResponse(common, { factor: 12, n: "2", d: "3" }).correct, true);
const small = getQuestion("R-SMALL");
assert.equal(JSON.stringify(small.response.items.map((item) => item.id)), JSON.stringify(["sort-1", "sort-2"]));
assert.equal(adapter.evaluateResponse(small, { sort: { "sort-1": "already_simplest", "sort-2": "can_simplify" }, factors: { "sort-1": "1", "sort-2": "7" } }).correct, true);
const valueRepair = getQuestion("R-VALUE");
assert.equal(valueRepair.response.options.length, 4, "R-VALUE must render all four approved repair routes");
assert.equal(adapter.evaluateResponse(valueRepair, valueRepair.answer.value).correct, true, "R-VALUE must accept its approved same-factor route");
assert.equal(adapter.evaluateResponse(valueRepair, valueRepair.response.options[1]).correct, false, "R-VALUE must reject a different operation on each number");
const arithmetic = getQuestion("R-ARITHMETIC-CHECK");
assert.equal(adapter.evaluateResponse(arithmetic, { values: ["4", "6"] }).correct, true);

assert.equal(approved.selectFreshRepairCheck({ repairId: "R-BOTH", usedRawFractionSignatures: new Set() }).id, "R-BOTH-CHECK-PDF");
assert.equal(approved.selectFreshRepairCheck({ repairId: "R-BOTH", usedRawFractionSignatures: new Set(["28/42"]) }).id, "R-BOTH-CHECK-FRESH");
const recoveryTwo = approved.selectRecoveryItems({ requiredCount: 2, missedFamilies: ["stop_early"], usedRawFractionSignatures: new Set(), usedItemIds: new Set() });
assert.equal(recoveryTwo.length, 2);
assert.equal(new Set(recoveryTwo.map((item) => item.id)).size, 2);
const recoveryThree = approved.selectRecoveryItems({ requiredCount: 3, missedFamilies: ["value_change", "smaller_numbers"], usedRawFractionSignatures: new Set(), usedItemIds: new Set() });
assert.equal(recoveryThree.length, 3);
assert.ok(recoveryThree.some((item) => /reasoning|application/.test(item.evidenceFamily)));

for (const id of ["M1", "M2", "M3", "M4", "M5"]) {
  const question = getQuestion(id);
  assert.equal(question.policy.hintPolicy, "none", `${id} cannot expose a hint`);
  assert.equal(question.policy.answerLocksOnSubmit, true, `${id} must lock before working appears`);
  assert.ok(/after_locked_submit|after_response/.test(question.policy.solutionPolicy), `${id} must reveal working only after submit`);
  assert.equal(question.model.workedUi.length > 0, true, `${id} must contain authored locked working`);
}
const m5 = getQuestion("M5");
assert.equal(Number(m5.model.totalTicketCount || m5.model.totalCount), 30);
assert.equal(Number(m5.model.selectedTicketCount || m5.model.selectedCount), 18);
const m5Before = visuals.renderMarkup(m5.visual, { question: m5, feedback: null });
const m5After = visuals.renderMarkup(m5.visual, { question: m5, feedback: "worked" });
assert.equal((m5Before.match(/<i class=/g) || []).length, 30, "M5 must render exactly 30 ticket tiles");
assert.equal((m5Before.match(/class="selected"/g) || []).length, 18, "M5 must mark exactly 18 ticket tiles");
assert.ok(!m5Before.includes("fra10-worked"), "M5 working must be hidden before answer lock");
assert.ok(m5After.includes("fra10-worked"), "M5 working must appear after answer lock");

const css = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
assert.match(css, /\.fra10-ticket-grid/);
assert.match(css, /@media\s*\(max-width:\s*700px\)/, "FRA10 needs a narrow-screen layout");
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, "FRA10 must honor reduced motion");
assert.match(css, /fra10-cue-hook-cue-3/, "FRA10 must bind visual reveal state to exact speech cues");

const exactMirrorPairs = ["js/fra10-approved-spec.js", "js/fra10-canonical.js", "js/fra10-visuals.js"];
for (const relativePath of exactMirrorPairs) {
  assert.equal(
    fs.readFileSync(path.join(fractionsDir, relativePath), "utf8"),
    fs.readFileSync(path.join(workspaceRoot, "revily-site", "public", "fractions", relativePath), "utf8"),
    `${relativePath} source and hosted mirror must match`
  );
}
const sourceStyles = fs.readFileSync(path.join(fractionsDir, "styles.css"), "utf8");
const hostedStyles = fs.readFileSync(path.join(workspaceRoot, "revily-site", "public", "fractions", "styles.css"), "utf8");
const fra10CssBlock = (text) => text.slice(text.indexOf("/* FRA-10: simplest-form visual and interaction language. */"), text.indexOf("/* FRA-22 owner-authorised", text.indexOf("/* FRA-10: simplest-form visual and interaction language. */")));
assert.ok(fra10CssBlock(sourceStyles).length > 1000, "FRA10 CSS block is missing from the source mirror");
assert.equal(fra10CssBlock(sourceStyles), fra10CssBlock(hostedStyles), "FRA10 CSS source and hosted blocks must match");
const sharedMirrorRequirements = {
  "index.html": ["js/fra10-approved-spec.js", "js/fra10-canonical.js", "js/fra10-visuals.js"],
  "js/skill-loader.js": ["RevilyFra10Adapter?.apply", "RevilyFra10Adapter.apply(spec)"],
  "js/lesson-model.js": ["fra10_simplest_form", "RevilyFra10Adapter?.validateQuestionModel"],
  "js/lesson-engine.js": ["fra10-simplest-form-handoff-v1", "routeFra10FinalEvidence", "fra10FinalRecovery", "RevilyFra10Adapter.evaluateResponse"],
  "js/visual-primitives.js": ["fra10_context", "RevilyFra10Visuals"],
  "tests/smoke-tests.js": ["canonicalFra10", "teaching_steps.length === 8", "confirmation_question_refs.length === 18"]
};
for (const [relativePath, markers] of Object.entries(sharedMirrorRequirements)) {
  const sourceText = fs.readFileSync(path.join(fractionsDir, relativePath), "utf8");
  const hostedText = fs.readFileSync(path.join(workspaceRoot, "revily-site", "public", "fractions", relativePath), "utf8");
  for (const marker of markers) {
    assert.ok(sourceText.includes(marker), `${relativePath} source mirror is missing FRA10 marker ${marker}`);
    assert.ok(hostedText.includes(marker), `${relativePath} hosted mirror is missing FRA10 marker ${marker}`);
  }
}

const root = {};
const engine = new windowObject.RevilyLessonEngine.LessonEngine(root, spec, { reaction_bank: [] }, { speechSynthesis: null });
engine.state.evidence.firstAttemptCorrect["FRA-10-G1"] = true;
engine.state.evidence.firstAttemptCorrect["FRA-10-G2"] = true;
assert.equal(engine.adaptiveNextId(model.getNode("G2")), "F2", "strong guided evidence may skip only F1");
engine.state.evidence.factorInvalid["FRA-10-G2"] = 1;
assert.equal(engine.adaptiveNextId(model.getNode("G2")), "F1", "an invalid factor must keep the standard route");
assert.equal(model.getNode("F1").nextId, "F2", "F2 must never be skipped");

localStorage.clear();
localStorage.setItem("revily.fractions.FRA-10.current.v1", JSON.stringify({
  version: 1,
  contentVersion: null,
  topicId: "fractions",
  skillId: "FRA-10",
  attemptId: "legacy-active",
  status: "LEARNING",
  cursor: "PRACTICE:2",
  soundOn: false,
  developerOpen: true,
  drafts: { legacy: "value" },
  submissions: { legacy: [{ response: "value" }] }
}));
const migratedActive = new windowObject.RevilyLessonEngine.LessonEngine(root, spec, { reaction_bank: [] }, { speechSynthesis: null });
assert.equal(migratedActive.state.contentVersion, "fra10-simplest-form-handoff-v1");
assert.equal(migratedActive.state.cursor, "HOOK");
assert.equal(migratedActive.state.soundOn, false);
assert.equal(migratedActive.state.developerOpen, true);
assert.equal(Object.keys(migratedActive.state.drafts).length, 0);
const activeHistory = JSON.parse(localStorage.getItem("revily.fractions.FRA-10.history.v1"));
assert.equal(activeHistory.at(-1).reason, "content_version_migration");

localStorage.clear();
localStorage.setItem("revily.fractions.FRA-10.current.v1", JSON.stringify({
  version: 1,
  contentVersion: null,
  topicId: "fractions",
  skillId: "FRA-10",
  attemptId: "legacy-secure",
  status: "SECURE",
  cursor: "COMPLETE",
  soundOn: true,
  exit: { result: "SECURE" }
}));
const migratedComplete = new windowObject.RevilyLessonEngine.LessonEngine(root, spec, { reaction_bank: [] }, { speechSynthesis: null });
assert.equal(migratedComplete.state.cursor, "COMPLETE", "completed FRA10 progress must remain complete");
assert.equal(migratedComplete.state.status, "SECURE", "completed FRA10 mastery must remain secure");

console.log("FRA10 canonical tests passed: exact copy, cues, route, interactions, repairs, recovery, answer lock, responsive CSS, mirrors, and migration.");
