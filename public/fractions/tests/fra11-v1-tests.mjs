import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const testsRoot = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(testsRoot, "..");
const repositoryRoot = resolve(appRoot, "..");
const context = vm.createContext({
  window: {}, console, URLSearchParams, setTimeout, clearTimeout,
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
});

async function load(relativePath) {
  const path = join(appRoot, relativePath);
  new vm.Script(await readFile(path, "utf8"), { filename: path }).runInContext(context);
}

await load("js/fra11-approved-spec.js");
await load("js/fra11-canonical.js");
await load("js/fra11-visuals.js");
await load("js/validators.js");
await load("js/lesson-model.js");

const approved = context.window.RevilyFra11Approved;
const canonical = context.window.RevilyFra11Canonical;
const runtime = approved.FRA11_RUNTIME_COPY;
assert.deepEqual([...approved.validateFRA11CanonicalSpec()], []);
assert.deepEqual([...canonical.validateRuntimeContract()], []);
assert.equal(Object.keys(runtime).length, 64);
assert.equal(new Set(Object.values(runtime).map((entry) => entry.text)).size, 64);
assert.ok(Object.values(runtime).every((entry) => entry.captionSource === "same_as_audio"));

const baseSpec = {
  schema_version: "1.2",
  identity: { id: "FRA-11", title: "Legacy FRA11" },
  dependencies: {}, diagnostic: {}, retrieval_practice: {}, lesson: {}, completion: {},
  voice_and_script: {}, visual_language: {}, engine_capability_requirements: {},
  experience_contract: { global_ui_copy: {} }
};
const spec = canonical.apply(baseSpec);
const question = (id) => spec.question_bank.find((item) => item.id === `FRA-11-${id}`);
const model = context.window.RevilyLessonModel.buildLessonModel(spec);
const validators = context.window.RevilyValidators;

assert.equal(spec.canonical_lesson.version, "fra11-canonical-handoff-v1");
assert.equal(spec.canonical_lesson.engine_profile, "fra11");
assert.equal(spec.diagnostic.enabled, false);
assert.equal(spec.retrieval_practice.enabled, false);
assert.deepEqual(Array.from(spec.dependencies.required_skill_refs), ["FRA-02", "FRA-06"]);
assert.deepEqual(Array.from(spec.lesson.teaching_steps, (step) => step.id), ["HOOK", "T1", "T2", "T3", "T4", "T5", "HANDOFF"]);
assert.deepEqual(Object.keys(spec.lesson.transfer_steps), ["G1", "G2", "F1", "F2", "I1", "I2"]);
assert.deepEqual(Array.from(spec.lesson.exit.primary_question_refs), ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-11-${id}`));
assert.equal(model.firstId, "HOOK");
assert.equal(model.getNode("G2").nextId, "F1");
assert.equal(model.getNode("F2").nextId, "I1");

const runtimeTexts = new Set(Object.values(runtime).map((entry) => entry.text));
const speakable = [];
spec.lesson.teaching_steps.forEach((step) => speakable.push(...[].concat(step.narration.script || [])));
Object.values(spec.lesson.transfer_steps).forEach((step) => speakable.push(...[].concat(step.pre_question_script || [])));
speakable.push(...[].concat(spec.lesson.exit.intro_script || []), spec.completion.secure.ryan_script);
spec.question_bank.forEach((item) => {
  [item.scripts?.before_submit, item.scripts?.on_correct_reaction, item.scripts?.on_incorrect_reaction,
    item.scripts?.on_incorrect_attempt_1, item.scripts?.on_incorrect_attempt_2, item.scripts?.reteach]
    .flat(Infinity).filter(Boolean).forEach((line) => speakable.push(line));
  (item.runtimeHintUtteranceIds || []).forEach((id) => speakable.push(runtime[id].text));
});
assert.ok(speakable.length > 0 && speakable.every((line) => runtimeTexts.has(line)), "A speakable FRA11 line escaped the runtime registry");
const visibleOnly = [
  ...Object.values(approved.FRA11_LEARNER_UI_COPY.questionPrompts),
  ...Object.values(approved.FRA11_LEARNER_UI_COPY.options).flat().map((option) => option.text),
  ...Object.values(approved.FRA11_LEARNER_UI_COPY.controls),
  ...Object.values(approved.FRA11_LEARNER_UI_COPY.workedChecks).flat()
];
assert.ok(visibleOnly.every((line) => !speakable.includes(line)), "Prompt, option, control or worked copy entered Ryan narration");

const cues = Object.values(approved.FRA11_TIMELINES).flat();
assert.equal(new Set(cues.map((cue) => cue.cueId)).size, cues.length);
assert.ok(cues.every((cue) => runtime[cue.utteranceId]?.text.includes(cue.anchorText)));
const brokenRuntime = { ...runtime };
delete brokenRuntime[cues[0].utteranceId];
assert.ok(canonical.validateRuntimeContract(brokenRuntime).length > 0, "Removing cue speech did not break the contract");

const correctResponses = {
  G1: { whole: "2", n: "3", d: "4" },
  G2: { quotient: "3", remainder: "2", whole: "3", n: "2", d: "5" },
  F1: { quotient: "3", remainder: "5", whole: "3", n: "5", d: "7" },
  F2: "4", I1: { whole: "3", n: "5", d: "8" }, I2: question("I2").answer.value,
  C1: { whole: "3", n: "7", d: "9" }, C2: { whole: "5", n: "1", d: "3" },
  M1: { whole: "5", n: "1", d: "6" }, M2: { whole: "2", n: "4", d: "5" }, M3: "5",
  M4: question("M4").answer.value, M5: question("M5").answer.value,
  "RG-C": { whole: "3", n: "2", d: "7" }, "RL-C": { whole: "3", n: "1", d: "6" },
  "RD-C": { whole: "4", n: "4", d: "5" }, "RF-C": { whole: "4", n: "5", d: "6" }, "RZ-C": "6",
  "MINI-1": { whole: "4", n: "5", d: "8" }, "MINI-2": { whole: "3", n: "1", d: "9" }
};
for (const [id, response] of Object.entries(correctResponses)) {
  assert.equal(validators.validate(question(id), response), true, `${id} rejected its canonical response`);
  assert.equal(canonical.classifyResponse(question(id), response).correct, true, `${id} did not select its correct branch`);
}

assert.deepEqual(Array.from(canonical.classifyResponse(question("G1"), { whole: "3", n: "3", d: "4" }).runtimeUtteranceIds), ["G1.INCORRECT.GROUP"]);
assert.deepEqual(Array.from(canonical.classifyResponse(question("G1"), { whole: "2", n: "0", d: "4" }).runtimeUtteranceIds), ["G1.INCORRECT.LEFTOVER"]);
assert.deepEqual(Array.from(canonical.classifyResponse(question("G1"), { whole: "2", n: "3", d: "5" }).runtimeUtteranceIds), ["G1.INCORRECT.DENOM"]);
assert.deepEqual(Array.from(canonical.classifyResponse(question("G1"), { whole: "3", n: "2", d: "4" }).runtimeUtteranceIds), ["G1.INCORRECT.FIELDS"]);
assert.equal(canonical.classifyResponse(question("G2"), { quotient: "4", remainder: "2", whole: "4", n: "2", d: "5" }).visibleFeedback, approved.FRA11_LEARNER_UI_COPY.visibleFeedback.G2_QUOTIENT_HIGH);
assert.equal(canonical.classifyResponse(question("G2"), { quotient: "3", remainder: "1", whole: "3", n: "1", d: "5" }).errorFamily, "R-LEFTOVER");
for (const id of ["M1", "M2", "M3", "M4", "M5"]) {
  const item = question(id);
  const wrong = item.response.type === "single_choice" ? item.response.options.find((option) => option !== item.answer.value)
    : item.response.type === "integer" ? "99" : { whole: "9", n: "1", d: String(item.model.math.denominator) };
  const evaluation = canonical.classifyResponse(item, wrong);
  assert.equal(evaluation.correct, false, `${id} accepted a wrong final response`);
  assert.deepEqual(Array.from(evaluation.runtimeUtteranceIds), ["FINAL.INCORRECT"], `${id} missed the shared final incorrect branch`);
  assert.equal(item.policy.hintPolicy, "none");
  assert.equal(item.policy.solutionPolicy, "after_locked_submit");
}

assert.equal(approved.classifyMixedNumberResponse({ numerator: 24, denominator: 6, response: { whole: 4 } }), "canonical_correct");
assert.equal(approved.classifyMixedNumberResponse({ numerator: 24, denominator: 6, response: { whole: 4, fractionNumerator: 0, fractionDenominator: 6 } }), "value_correct_noncanonical_exact_whole");
assert.equal(approved.classifyMixedNumberResponse({ numerator: 40, denominator: 8, response: { whole: 4, fractionNumerator: 8, fractionDenominator: 8 } }), "value_correct_noncanonical_exact_whole");
assert.equal(approved.shouldSkipF1({ g1FirstAttemptCorrect: true, g2FirstAttemptCorrect: true, supportEscalated: false, centralMisconceptionObserved: false }), true);
assert.equal(approved.routeFinalCheck({ correctCount: 5, hasDirectProceduralEvidence: true, hasVisualReasoningOrErrorAnalysisEvidence: true, repeatedBlockingMisconception: false }), "finish_candidate");
assert.equal(approved.routeFinalCheck({ correctCount: 3, hasDirectProceduralEvidence: true, hasVisualReasoningOrErrorAnalysisEvidence: true, repeatedBlockingMisconception: false }), "targeted_repair_then_two_item_check");
assert.equal(approved.routeFinalCheck({ correctCount: 2, hasDirectProceduralEvidence: false, hasVisualReasoningOrErrorAnalysisEvidence: true, repeatedBlockingMisconception: false }), "targeted_repair_then_fresh_three_item_final");

assert.deepEqual({ ...spec.lesson.adaptive_pathway.no_hint_confirmation_by_question }, {
  "FRA-11-F1": "FRA-11-C1", "FRA-11-F2": "FRA-11-RZ-C", "FRA-11-I1": "FRA-11-C1", "FRA-11-I2": "FRA-11-C2"
});
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
assert.equal(spec.lesson.transfer_steps.F2.correct_next, "I1");
for (const family of ["R-GROUP", "R-LEFTOVER", "R-DENOM", "R-FIELDS", "R-ZERO"]) {
  assert.ok(spec.lesson.adaptive_pathway.repair_by_error_family[family]);
  assert.ok(spec.lesson.adaptive_pathway.fresh_checks_by_error_family[family]?.length);
}

const generatedSelection = canonical.selectFreshRecoveryQuestionIds({
  count: 3,
  seenQuestionIds: approved.FRA11.recoveryPolicy.freshPool,
  seenPairs: approved.FRA11_QUESTIONS.filter((item) => item.math).map((item) => `${item.math.numerator}/${item.math.denominator}`),
  missedFamilies: ["visual_grouping"]
});
assert.equal(generatedSelection.ids.length, 3);
assert.deepEqual(Array.from(generatedSelection.generatedSeeds), [1, 2, 3]);
const generated = generatedSelection.ids.map((id, index) => canonical.generatedQuestion(index, []));
assert.equal(new Set(generated.map((item) => item.model.canonicalSignature)).size, 3);
generated.forEach((item) => assert.deepEqual([...canonical.validateQuestionModel(item)], []));

const visuals = context.window.RevilyFra11Visuals;
const m2Before = visuals.renderMarkup({ model: question("M2").model }, { question: question("M2"), feedback: "initial" });
assert.equal((m2Before.match(/class="fra11-piece(?:\s|")/g) || []).length, 14);
assert.doesNotMatch(m2Before, /complete group|left|2 4\/5/i);
assert.doesNotMatch(visuals.accessibleDescription(question("M2").model, { question: question("M2"), feedback: "initial" }), /fourteen|14|two wholes|four left/i);
const m2After = visuals.renderMarkup({ model: question("M2").model }, { question: question("M2"), feedback: "worked" });
assert.match(m2After, /data-group-index="0"/);
assert.match(m2After, /data-group-index="2"/);
assert.match(m2After, />2<|>2<\/strong>/);
const hook = visuals.renderMarkup({ scene: { model: spec.lesson.teaching_steps[0].scene.model } }, { feedback: "initial" });
assert.equal((hook.match(/class="fra11-piece(?:\s|")/g) || []).length, 26);
assert.equal((hook.match(/data-fra11-layer="initial"/g) || []).length, 1);
assert.equal((hook.match(/data-fra11-layer="revealed"/g) || []).length, 1);
assert.deepEqual(Array.from(spec.lesson.teaching_steps[0].scene.model.grouping), [4, 4, 4, 1]);

const engineSource = await readFile(join(appRoot, "js", "lesson-engine.js"), "utf8");
assert.match(engineSource, /fra11-canonical-handoff-v1/);
assert.match(engineSource, /division_then_mixed/);
assert.match(engineSource, /routeFra11FinalEvidence/);
assert.match(engineSource, /advanceFra11Recovery/);
assert.match(engineSource, /content_version_migration/);
const styles = await readFile(join(appRoot, "styles.css"), "utf8");
assert.match(styles, /\.fra11-piece[\s\S]*aspect-ratio/);
assert.match(styles, /@media \(max-width: 520px\)[\s\S]*\.fra11-piece/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.fra11-visual/);

const mirroredFiles = [
  "index.html", "styles.css", "js/skill-loader.js", "js/validators.js", "js/lesson-model.js", "js/lesson-engine.js", "js/visual-primitives.js",
  "js/fra11-approved-spec.js", "js/fra11-canonical.js", "js/fra11-visuals.js"
];
for (const relativePath of mirroredFiles) {
  const source = await readFile(join(appRoot, relativePath));
  const hosted = await readFile(join(repositoryRoot, "revily-site", "public", "fractions", relativePath));
  const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
  assert.equal(digest(source), digest(hosted), `${relativePath} hosted mirror is stale`);
}

console.log("FRA11 v1 canonical copy, question, outcome, route, recovery, visual, accessibility and mirror tests: PASS");
