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
let checks = 0;
const plain = (value) => JSON.parse(JSON.stringify(value));

function check(name, fn) {
  fn();
  checks += 1;
  process.stdout.write(`PASS ${String(checks).padStart(2, "0")} ${name}\n`);
}

function compileApprovedSpec() {
  const specPath = path.join(workspace, "FRA21_CANONICAL_SPEC.ts");
  const compiled = ts.transpileModule(fs.readFileSync(specPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true },
    fileName: specPath,
    reportDiagnostics: true
  });
  const errors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors, []);
  const moduleRecord = { exports: {} };
  vm.runInNewContext(compiled.outputText, { module: moduleRecord, exports: moduleRecord.exports }, { filename: specPath });
  return moduleRecord.exports;
}

const approvedSource = compileApprovedSpec();
const context = { window: {}, console };
vm.createContext(context);
for (const relative of [
  "fractions/js/fra21-approved-spec.js",
  "fractions/js/fra21-canonical.js",
  "fractions/js/fra21-visuals.js",
  "fractions/js/lesson-model.js"
]) {
  const filename = path.join(workspace, relative);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
}

const approved = context.window.RevilyFra21V1;
const adapter = context.window.RevilyFra21Canonical;
const visuals = context.window.RevilyFra21Visuals;
const legacy = yaml.load(fs.readFileSync(path.join(workspace, "FRA 01 to 28/revily_fractions_v1_2/skills/FRA-21_COMPLETE_v1.2.yaml"), "utf8"));
const spec = adapter.apply(structuredClone(legacy));
const model = context.window.RevilyLessonModel.buildLessonModel(spec);
const question = (id) => spec.question_bank.find((item) => item.canonicalQuestionId === id);
const canonicalQuestions = [
  ...approved.coreQuestions,
  ...approved.confirmations,
  ...approved.repairs.flatMap((repair) => [repair.supportedInteraction, ...repair.freshRechecks]),
  ...approved.recoveryBank
];

function canonicalCorrectResponse(item) {
  if (item.answer.kind === "fraction_value") return { kind: "fraction", value: plain(item.answer.canonical) };
  if (item.answer.kind === "integer_fields") return { kind: "integer_fields", values: plain(item.answer.expected) };
  if (item.answer.kind === "single_choice") return { kind: "single_choice", optionId: item.answer.correctOptionId };
  if (item.answer.kind === "composite") return { kind: "composite", optionId: item.answer.correctOptionId, values: plain(item.answer.expectedFields) };
  if (item.answer.kind === "ordered_steps") return { kind: "ordered_steps", order: [...item.answer.correctOrder] };
  throw new Error(`${item.id}: unknown answer kind ${item.answer.kind}`);
}

function canonicalWrongResponse(item) {
  if (item.answer.kind === "fraction_value") return { kind: "fraction", value: { numerator: 0, denominator: 1 } };
  if (item.answer.kind === "integer_fields") return { kind: "integer_fields", values: Object.fromEntries(Object.keys(item.answer.expected).map((id) => [id, 999])) };
  if (item.answer.kind === "single_choice") return { kind: "single_choice", optionId: item.response.optionIds.find((id) => id !== item.answer.correctOptionId) };
  if (item.answer.kind === "composite") return { kind: "composite", optionId: item.response.optionIds.find((id) => id !== item.answer.correctOptionId), values: Object.fromEntries(Object.keys(item.answer.expectedFields).map((id) => [id, 999])) };
  if (item.answer.kind === "ordered_steps") return { kind: "ordered_steps", order: [...item.answer.correctOrder].reverse() };
  throw new Error(`${item.id}: unknown answer kind ${item.answer.kind}`);
}

function adapterCorrectResponse(item) {
  const converted = question(item.id);
  if (item.answer.kind === "fraction_value") return { n: String(item.answer.canonical.numerator), d: String(item.answer.canonical.denominator) };
  if (item.answer.kind === "integer_fields") return Object.fromEntries(Object.entries(item.answer.expected).map(([id, value]) => [id, String(value)]));
  if (item.answer.kind === "single_choice") return Object.entries(converted.response.optionIds).find(([, id]) => id === item.answer.correctOptionId)[0];
  if (item.answer.kind === "composite") {
    const choice = Object.entries(converted.response.optionIds).find(([, id]) => id === item.answer.correctOptionId)[0];
    return { choice, whole: String(Object.values(item.answer.expectedFields)[0]) };
  }
  if (item.answer.kind === "ordered_steps") return [...item.answer.correctOrder];
  throw new Error(`${item.id}: unknown answer kind ${item.answer.kind}`);
}

check("approved TypeScript compiles and validates", () => assert.deepEqual(plain(approvedSource.validateFRA21CanonicalSpec()), []));
check("browser artifact is an exact approved registry build", () => {
  assert.deepEqual(plain(approved.spec), plain(approvedSource.FRA21));
  assert.deepEqual(plain(approved.runtimeCopy), plain(approvedSource.FRA21_RUNTIME_COPY));
  assert.deepEqual(plain(approved.learnerUiCopy), plain(approvedSource.FRA21_LEARNER_UI_COPY));
});
check("runtime contains 44 exact Ryan utterances", () => assert.equal(Object.keys(approved.runtimeCopy).length, 44));
check("learner UI registry contains 292 approved entries", () => assert.equal(Object.keys(approved.learnerUiCopy).length, 292));
check("adapter runtime contract validates", () => assert.deepEqual(plain(adapter.validateRuntimeContract()), []));
check("identity, title, status, and version are owner-approved", () => {
  assert.equal(spec.identity.id, "FRA-21");
  assert.equal(spec.identity.title, "Subtract Fractions Where One Denominator Is a Multiple of the Other");
  assert.equal(spec.canonical_lesson.version, "FRA21-HANDOFF-V1");
  assert.equal(spec.identity.status, "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1");
});
check("no Diagnostic or Retrieval layer is enabled", () => {
  assert.equal(spec.diagnostic.enabled, false);
  assert.equal(spec.retrieval_practice.enabled, false);
  assert.deepEqual(plain(spec.diagnostic.question_refs), []);
  assert.deepEqual(plain(spec.retrieval_practice.question_refs), []);
});
check("exact teaching sequence precedes guided practice", () => assert.deepEqual(plain(spec.lesson.teaching_steps.map((step) => step.id)), ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF"]));
check("exact guided, faded, independent, and five-item final sequence is wired", () => assert.deepEqual(plain(model.nodes.map((node) => node.id)), ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF", "G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"]));
check("all 37 scored objects are present exactly once", () => {
  assert.equal(canonicalQuestions.length, 37);
  assert.equal(new Set(canonicalQuestions.map((item) => item.id)).size, 37);
  canonicalQuestions.forEach((item) => assert.ok(question(item.id), item.id));
});
check("every scored object accepts its approved answer", () => canonicalQuestions.forEach((item) => assert.equal(approved.evaluateQuestion(item.id, canonicalCorrectResponse(item)).correct, true, item.id)));
check("every scored object rejects a deliberately wrong answer", () => canonicalQuestions.forEach((item) => assert.equal(approved.evaluateQuestion(item.id, canonicalWrongResponse(item)).correct, false, item.id)));
check("adapter preserves correctness for every supported response control", () => canonicalQuestions.forEach((item) => assert.equal(adapter.evaluateResponse(question(item.id), adapterCorrectResponse(item)).correct, true, item.id)));
check("M2 enforces both missing numerators", () => {
  assert.equal(adapter.evaluateResponse(question("M2"), { convertedFirstNumerator: "10", resultNumerator: "3" }).correct, true);
  assert.equal(adapter.evaluateResponse(question("M2"), { convertedFirstNumerator: "10", resultNumerator: "7" }).correct, false);
});
check("value questions accept exact equivalent fractions", () => assert.equal(adapter.evaluateResponse(question("M3"), { n: "1", d: "2" }).correct, true));
check("all choice controls map learner labels back to canonical option IDs", () => ["F2", "M5", "R-ORDER-S", "RM-METHOD-1", "RM-ERROR-1", "RM-ORDER-1"].forEach((id) => assert.equal(adapter.evaluateResponse(question(id), adapterCorrectResponse(approved.getQuestionById(id))).correct, true, id)));
check("all teaching and repair cues resolve to exact utterance anchors", () => {
  const cueContainers = [...approved.teachingScenes, ...approved.repairs];
  assert.equal(approved.teachingScenes.flatMap((scene) => scene.timeline).length, 21);
  assert.equal(approved.repairs.flatMap((repair) => repair.timeline).length, 15);
  cueContainers.flatMap((container) => container.timeline || []).forEach((cue) => {
    assert.ok(approved.runtimeCopy[cue.utteranceId], cue.id);
    assert.ok(approved.runtimeCopy[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()), cue.id);
    assert.equal(cue.mustNotOccurBeforeAnchor, true, cue.id);
    assert.ok(cue.reducedMotionEquivalent.trim(), cue.id);
  });
});
check("teaching and repair visuals carry all 36 approved word-boundary cues", () => {
  const teachingCues = spec.lesson.teaching_steps.flatMap((step) => step.narration.sync_cues || []);
  const repairCues = approved.repairs.flatMap((repair) => question(repair.id).visual.syncCues || []);
  assert.equal(teachingCues.length, 21);
  assert.equal(repairCues.length, 15);
});
check("all narration text is registry-owned and captions share the audio source", () => {
  Object.entries(approved.runtimeCopy).forEach(([id, utterance]) => {
    assert.equal(utterance.captionSource, "same_as_audio", id);
    assert.ok(utterance.text.trim(), id);
  });
  const registered = new Set(Object.values(approved.runtimeCopy).map((entry) => entry.text));
  spec.lesson.teaching_steps.flatMap((step) => step.narration.script).forEach((line) => assert.ok(registered.has(line), line));
  spec.question_bank.flatMap((item) => item.runtimeUtteranceIds || []).forEach((id) => assert.ok(approved.runtimeCopy[id], id));
});
check("learner UI is never routed into automatic speech", () => spec.question_bank.forEach((item) => assert.equal(item.speechPolicy?.autoSpeakLearnerUi, false, item.id)));
check("Ryan live word-boundary speech and progressive captions are required", () => {
  assert.equal(spec.voice_and_script.narration_playback.mode, "browser_speech_ryan");
  assert.equal(spec.voice_and_script.narration_playback.require_ryan_voice, true);
  assert.equal(spec.voice_and_script.caption_presentation.mode, "on_canvas_progressive");
  assert.equal(spec.voice_and_script.caption_presentation.transcript_bar, false);
});
check("strong guided evidence skips F1 but always retains F2", () => {
  const strong = ["G1", "G2"].map((id) => ({ questionId: id, firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false, observedErrorFamilies: [] }));
  assert.equal(adapter.shouldSkipF1(strong), true);
  assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
});
check("guided misses, hints, support, or central errors prevent the fast route", () => {
  const base = ["G1", "G2"].map((id) => ({ questionId: id, firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false, observedErrorFamilies: [] }));
  for (const mutation of [
    (records) => { records[0].firstAttemptCorrect = false; },
    (records) => { records[1].hintOpenedBeforeSubmit = true; },
    (records) => { records[0].supportEscalated = true; },
    (records) => { records[1].errorFamily = "BOTH"; }
  ]) {
    const records = structuredClone(base);
    mutation(records);
    assert.equal(adapter.shouldSkipF1(records), false);
  }
});
check("all four optional hints require the approved fresh confirmation", () => assert.deepEqual(plain(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question), {
  "FRA-21-F1": "FRA-21-C-DIRECT",
  "FRA-21-I1": "FRA-21-C-DIRECT",
  "FRA-21-F2": "FRA-21-C-FIRST",
  "FRA-21-I2": "FRA-21-C-FIRST"
}));
check("all five repair families have an intro, supported interaction, and fresh recheck", () => approved.repairs.forEach((repair) => {
  const converted = question(repair.id);
  assert.equal(converted.supportedInteractionId, `FRA-21-${repair.supportedInteraction.id}`);
  assert.deepEqual(plain(converted.freshCheckIds), plain(repair.freshRechecks.map((item) => `FRA-21-${item.id}`)));
  assert.ok(question(repair.supportedInteraction.id));
  repair.freshRechecks.forEach((item) => assert.ok(question(item.id)));
}));
check("repair intro visuals use the exact narrated examples", () => {
  const markup = Object.fromEntries(approved.repairs.map((repair) => [repair.id, visuals.renderMarkup(null, { feedback: "initial", question: question(repair.id) })]));
  assert.ok(markup["R-BOTH"].includes("7 over 10") && markup["R-BOTH"].includes("4 over 10"));
  assert.ok(markup["R-SCALE"].includes("1 over 8") && markup["R-SCALE"].includes("2 over 8"));
  assert.ok(markup["R-EARLY"].includes("7 over 8") && markup["R-EARLY"].includes("5 over 8"));
  assert.ok(markup["R-ORDER"].includes("3 over 4") && markup["R-ORDER"].includes("6 over 8"));
  assert.ok(markup["R-DENOM"].includes("7 over 10") && markup["R-DENOM"].includes("3/5"));
});
check("R-EARLY alternates fresh rechecks without repeating the seen form", () => {
  assert.equal(adapter.selectFreshCheckId("EARLY", []), "FRA-21-R-EARLY-RC-A");
  assert.equal(adapter.selectFreshCheckId("EARLY", ["FRA-21-R-EARLY-RC-A"]), "FRA-21-R-EARLY-RC-B");
});
const finalRecord = (id, correct = true) => ({ questionId: `FRA-21-${id}`, firstAttemptCorrect: correct, countsAsIndependentEvidence: true, assessmentFamilies: plain(question(id).evidenceFamily) });
check("4/5 with procedural and reasoning/application evidence finishes", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("M2"), finalRecord("M3"), finalRecord("M4"), finalRecord("M5", false)], false), "finish_candidate"));
check("3/5 routes to repair plus two fresh checks", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("M2"), finalRecord("M3"), finalRecord("M4", false), finalRecord("M5", false)], false), "repair_then_two_item_minicheck"));
check("0-2/5 routes to repair plus three fresh checks", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("M2"), finalRecord("M3", false), finalRecord("M4", false), finalRecord("M5", false)], false), "repair_then_three_item_final"));
check("repeated blocking evidence prevents direct finish", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("M2"), finalRecord("M3"), finalRecord("M4"), finalRecord("M5")], true), "repair_blocker_then_confirmation"));
check("all 1000 deterministic recovery seeds stay fresh and cover required families", () => {
  for (let seed = 0; seed < 1000; seed += 1) {
    for (const count of [2, 3]) {
      const ids = adapter.selectRecoveryQuestionIds(count, ["DIRECT", "CONTEXT"], ["FRA-21-RM-DIRECT-1"], seed);
      assert.equal(ids.length, count, `${seed}:${count}`);
      assert.equal(new Set(ids).size, count, `${seed}:${count}:unique`);
      assert.ok(!ids.includes("FRA-21-RM-DIRECT-1"), `${seed}:${count}:fresh`);
      const families = ids.flatMap((id) => question(id.replace("FRA-21-", "")).evidenceFamily);
      assert.ok(families.includes("PROCEDURAL"), `${seed}:${count}:procedural`);
      assert.ok(families.includes("REASONING_APPLICATION"), `${seed}:${count}:reasoning`);
    }
  }
});
check("final answers lock and reveal sequential working only after submit", () => spec.lesson.exit.primary_question_refs.forEach((id) => {
  const item = spec.question_bank.find((candidate) => candidate.id === id);
  assert.equal(item.policy.answerLocksOnSubmit, true, id);
  assert.equal(item.policy.solutionPolicy, "after_locked_submit", id);
  assert.ok(item.scripts.worked_steps.length >= 2, id);
  const initial = visuals.renderMarkup(null, { feedback: "initial", question: item });
  const worked = visuals.renderMarkup(null, { feedback: "worked", question: item });
  assert.ok(!initial.includes("ANSWER LOCKED"), id);
  assert.ok(worked.includes("ANSWER LOCKED"), id);
  assert.ok(worked.includes("<ol>"), id);
}));
check("hook faithfully renders seven of eight battery cells and a quarter update", () => {
  const hookNode = model.getNode("HOOK");
  const markup = visuals.renderMarkup(hookNode.visual, {});
  assert.equal((markup.match(/fra21-battery-grid/g) || []).length, 1);
  assert.equal((markup.match(/is-filled/g) || []).length, 7);
  assert.ok(markup.includes("fra21-quarter-piece"));
});
check("question visuals do not reveal scored answers before submission", () => ["M1", "M2", "M3", "M4", "M5"].forEach((id) => {
  const item = question(id);
  const markup = visuals.renderMarkup(null, { feedback: "initial", question: item });
  assert.ok(!markup.includes("ANSWER LOCKED"), id);
  assert.ok(!markup.includes("fra21-worked"), id);
}));
check("every visual has a non-empty accessible equivalent", () => {
  model.nodes.forEach((node) => assert.ok(visuals.accessibleDescription(node.question?.model || node.visual?.scene?.model || {}, { feedback: "initial" }).trim(), node.id));
});
check("learner registries contain no implementation or owner-review leakage", () => {
  const learnerText = JSON.stringify({ runtime: approved.runtimeCopy, ui: approved.learnerUiCopy }).toLowerCase();
  ["owner-approved", "implementation handoff", "authoronly", "classificationcaution", "routing contract"].forEach((phrase) => assert.ok(!learnerText.includes(phrase), phrase));
});
check("active route loads the three FRA21 browser assets", () => {
  const html = fs.readFileSync(path.join(workspace, "fractions/index.html"), "utf8");
  ["fra21-approved-spec.js", "fra21-canonical.js", "fra21-visuals.js"].forEach((asset) => assert.ok(html.includes(asset), asset));
});
check("engine hooks are isolated to the FRA21 profile and content version", () => {
  const engine = fs.readFileSync(path.join(workspace, "fractions/js/lesson-engine.js"), "utf8");
  ["isFra21V1", "FRA21-HANDOFF-V1", "handleFra21Outcome", "routeFra21FinalEvidence", "fra21FinalRecovery", "legacy-fra21-yaml"].forEach((token) => assert.ok(engine.includes(token), token));
});
check("completion has no hard-coded next lesson", () => {
  const text = JSON.stringify(spec.completion);
  assert.ok(!text.includes("FRA-22"));
  assert.deepEqual(plain(spec.completion.secure.buttons), ["Back to Fractions", "Start again"]);
});

process.stdout.write(`\nFRA-21 contract suite passed: ${checks} checks.\n`);
