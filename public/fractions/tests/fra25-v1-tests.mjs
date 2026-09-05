import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "../../..");
const require = createRequire(import.meta.url);
const yaml = require(path.join(site, "node_modules/js-yaml"));
const plain = (value) => JSON.parse(JSON.stringify(value));
let checks = 0;

function check(name, fn) {
  fn();
  checks += 1;
  process.stdout.write(`PASS ${String(checks).padStart(2, "0")} ${name}\n`);
}

const context = { window: {}, console };
vm.createContext(context);
for (const relative of [
  "public/fractions/js/fra25-approved-spec.js",
  "public/fractions/js/fra25-canonical.js",
  "public/fractions/js/fra25-visuals.js"
]) {
  const filename = path.join(site, relative);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
}

const approved = context.window.RevilyFra25Approved;
const adapter = context.window.RevilyFra25Canonical;
const visuals = context.window.RevilyFra25Visuals;
const legacyPath = path.join(site, "public/FRA 01 to 28/revily_fractions_v1_2/skills/FRA-25_COMPLETE_v1.2.yaml");
const legacy = yaml.load(fs.readFileSync(legacyPath, "utf8"));
const spec = adapter.apply(structuredClone(legacy));
const question = (id) => spec.question_bank.find((item) => item.canonicalQuestionId === id);

check("validateFRA25LessonSpec passes", () => assert.deepEqual(plain(approved.validateFRA25LessonSpec()), []));
check("runFRA25StaticAssertions passes", () => assert.deepEqual(plain(approved.runFRA25StaticAssertions()), []));
check("runtime registry has all 55 canonical utterances", () => assert.equal(Object.keys(approved.FRA25_RUNTIME_COPY).length, 55));
check("adapter runtime contract passes", () => assert.deepEqual(plain(adapter.validateRuntimeContract()), []));
check("active identity uses FRA25-HANDOFF-V1", () => {
  assert.equal(spec.identity.id, "FRA-25");
  assert.equal(spec.identity.title, "Simplify Before Multiplying Fractions");
  assert.equal(spec.canonical_lesson.version, "FRA25-HANDOFF-V1");
});
check("Diagnostic and Retrieval remain disabled", () => {
  assert.equal(spec.diagnostic.enabled, false);
  assert.equal(spec.retrieval_practice.enabled, false);
  assert.deepEqual(plain(spec.diagnostic.question_refs), []);
  assert.deepEqual(plain(spec.retrieval_practice.question_refs), []);
});
check("teaching sequence includes T5 and the non-scored hook choice", () => {
  assert.deepEqual(plain(spec.lesson.teaching_steps.map((step) => step.id)), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "T5", "HANDOFF"]);
  assert.equal(question("HOOK-CHOICE").policy.engagementOnly, true);
  assert.equal(question("HOOK-CHOICE").policy.scored, false);
});
check("hook contains both exact calculation routes", () => {
  const hook = approved.FRA25_TEACHING_SCENES.find((scene) => scene.id === "HOOK");
  assert.equal(hook.visual.visibleExpression, "18/35 × 14/27");
  assert.ok(hook.visual.beforeSubmitState.some((line) => line.includes("252/945")));
  assert.ok(hook.visual.beforeSubmitState.some((line) => line.includes("2/5 × 2/3 = 4/15")));
});
check("all teaching cue anchors are exact runtime substrings", () => {
  approved.FRA25_TEACHING_SCENES.flatMap((scene) => scene.timedVisualEvents).forEach((cue) => {
    const utterance = approved.FRA25_RUNTIME_COPY[cue.utteranceId];
    assert.ok(utterance, cue.utteranceId);
    assert.ok(utterance.text.toLowerCase().includes(cue.anchorText.toLowerCase()), cue.id);
  });
});
check("every cue target exists in the rendered scene", () => {
  approved.FRA25_TEACHING_SCENES.forEach((scene) => {
    const step = spec.lesson.teaching_steps.find((item) => item.id === scene.id);
    const markup = visuals.renderMarkup({ scene: { model: step.scene.model }, syncCues: step.narration.sync_cues }, { feedback: "initial" });
    scene.timedVisualEvents.flatMap((event) => event.targetIds).forEach((targetId) => assert.ok(markup.includes(`id="${targetId}"`), `${scene.id}: ${targetId}`));
  });
});
check("all adapter narration IDs and text are registry-owned", () => {
  spec.question_bank.flatMap((item) => item.runtimeUtteranceIds || []).forEach((id) => assert.ok(approved.FRA25_RUNTIME_COPY[id], id));
  spec.lesson.teaching_steps.flatMap((step) => step.narration?.script || []).forEach((line) => assert.ok(spec.canonical_lesson.runtime_copy_text_to_id[line], line));
});
check("caption and live Ryan contracts are exact", () => {
  assert.equal(spec.voice_and_script.narration_playback.mode, "browser_speech_ryan");
  assert.equal(spec.voice_and_script.narration_playback.require_ryan_voice, true);
  assert.equal(spec.voice_and_script.caption_presentation.mode, "on_canvas_progressive");
  Object.values(approved.FRA25_RUNTIME_COPY).forEach((entry) => assert.equal(entry.captionSource, "same_as_audio"));
});
check("F2 implements the mandatory 14-and-21 divide-by-7 correction", () => {
  const f2 = question("F2");
  assert.equal(f2.canonicalQuestion.response.choices.find((item) => item.id === "A").text, "Divide 14 and 21 by 7.");
  assert.ok(!f2.canonicalQuestion.response.choices.some((item) => item.text.includes("8 and 14")));
  assert.equal(adapter.evaluateResponse(f2, "Divide 14 and 21 by 7.").correct, true);
  assert.equal(f2.canonicalQuestion.answer.finalFraction.numerator, 16);
  assert.equal(f2.canonicalQuestion.answer.finalFraction.denominator, 45);
});
check("G1 accepts an approved pair, divisor and exact final fraction", () => {
  const result = adapter.evaluateResponse(question("G1"), { numeratorSlot: "right_numerator", denominatorSlot: "left_denominator", divisor: "7", n: "4", d: "5" });
  assert.equal(result.correct, true);
  assert.deepEqual(plain(result.utteranceIds), ["G1.CORRECT"]);
});
check("G1 one-sided/shared error never selects the correct branch", () => {
  const result = adapter.evaluateResponse(question("G1"), { numeratorSlot: "right_numerator", denominatorSlot: "left_denominator", divisor: "2", n: "4", d: "5" });
  assert.equal(result.correct, false);
  assert.equal(result.errorFamily, "SHARED");
  assert.ok(!result.utteranceIds.includes("G1.CORRECT"));
});
check("F2 same-side and inexact-divisor choices classify separately", () => {
  assert.equal(adapter.evaluateResponse(question("F2"), "Divide 21 and 15 by 3.").errorFamily, "PAIR");
  assert.equal(adapter.evaluateResponse(question("F2"), "Divide 8 and 21 by 4.").errorFamily, "SHARED");
});
check("I2 same-side acceptance is PAIR evidence", () => assert.equal(adapter.evaluateResponse(question("I2"), "The step is valid because 6 and 15 share 3.").errorFamily, "PAIR"));
check("equivalent but unfinished final fraction is FINISH evidence", () => {
  const result = adapter.evaluateResponse(question("M1"), { n: "6", d: "20" });
  assert.equal(result.correct, false);
  assert.equal(result.errorFamily, "FINISH");
  assert.deepEqual(plain(result.utteranceIds), ["FINAL.INCORRECT"]);
});
check("M2 validates every reduced factor and final field", () => {
  const correct = { leftNumerator: "4", leftDenominator: "5", rightNumerator: "2", rightDenominator: "9", finalNumerator: "8", finalDenominator: "45" };
  assert.equal(adapter.evaluateResponse(question("M2"), correct).correct, true);
  assert.equal(adapter.evaluateResponse(question("M2"), { ...correct, rightDenominator: "8" }).correct, false);
});
check("M4 explicit term cancellation is stable TERM evidence", () => {
  const m4 = question("M4");
  const response = "Valid: cancel the 5 in (3 + 5) with 10.";
  assert.equal(adapter.classifyErrorFamily(m4, response), "TERM");
  assert.equal(adapter.requiresRepeatedEvidence(m4, response), false);
});
check("no-cancel reasoning distinguishes NONE from same-side PAIR", () => {
  assert.equal(adapter.classifyErrorFamily(question("M3"), "Cancel 5 with 8."), "NONE");
  assert.equal(adapter.classifyErrorFamily(question("M3"), "Cancel 8 with 9."), "PAIR");
});
check("strong route skips F1 but retains F2", () => {
  const clean = { firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false };
  assert.equal(adapter.shouldSkipF1({ g1: clean, g2: clean, unresolvedCentralErrors: [] }), true);
  assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
  assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.otherwise, "F1");
});
check("central evidence prevents the strong route", () => {
  const clean = { firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false };
  assert.equal(adapter.shouldSkipF1({ g1: clean, g2: clean, unresolvedCentralErrors: ["PAIR"] }), false);
});
check("all optional-hint items map to a same-family no-hint confirmation", () => {
  const map = spec.lesson.adaptive_pathway.no_hint_confirmation_by_question;
  assert.equal(map["FRA-25-F1"], "FRA-25-C-DIRECT");
  assert.equal(map["FRA-25-F2"], "FRA-25-C-PAIR");
  assert.equal(map["FRA-25-I1"], "FRA-25-C-DIRECT");
  assert.equal(map["FRA-25-I2"], "FRA-25-C-PAIR");
});
check("all five repairs include authored teaching, supported interaction and fresh recheck", () => {
  approved.FRA25_REPAIRS.forEach((repair) => {
    const intro = question(repair.id);
    assert.ok(intro.scripts.reteach.length >= 3, repair.id);
    assert.equal(intro.supportedInteractionId, adapter.prefix(repair.supportedInteraction.id));
    assert.equal(intro.freshCheckId, adapter.prefix(repair.freshIndependentRecheck.id));
    assert.ok(question(repair.supportedInteraction.id));
    assert.ok(question(repair.freshIndependentRecheck.id));
  });
});
check("all five primary finals have no hints and lock before working", () => {
  spec.lesson.exit.primary_question_refs.forEach((id) => {
    const item = spec.question_bank.find((candidate) => candidate.id === id);
    assert.equal(item.policy.hintPolicy, "none");
    assert.equal(item.policy.answerLocksOnSubmit, true);
    assert.equal(item.policy.solutionPolicy, "after_locked_submit");
    assert.ok(item.scripts.worked_steps.length >= 3);
  });
});

const finalRecord = (id, family, correct, errors = []) => ({
  questionId: id,
  stage: "final",
  family,
  firstAttemptCorrect: correct,
  attempts: 1,
  hintOpenedBeforeSubmit: false,
  supportEscalated: false,
  answerLocked: true,
  observedErrorFamilies: errors
});
check("4/5 with procedural and reasoning breadth finishes", () => {
  const records = [finalRecord("M1", "DIRECT", true), finalRecord("M2", "STEP", true), finalRecord("M3", "REASON", true), finalRecord("M4", "ERROR", true), finalRecord("M5", "MATCH", false, ["UNKNOWN"])];
  assert.equal(approved.evaluatePrimaryFinal(records).action, "finish");
});
check("repeated blocker prevents a 4/5 finish", () => {
  const records = [finalRecord("M1", "DIRECT", true), finalRecord("M2", "STEP", true), finalRecord("M3", "REASON", false, ["NONE"]), finalRecord("M4", "ERROR", true), finalRecord("M5", "MATCH", true, ["NONE"])];
  assert.notEqual(approved.evaluatePrimaryFinal(records).action, "finish");
});
check("3/5 selects repair plus exactly two fresh items", () => {
  const records = [finalRecord("M1", "DIRECT", true), finalRecord("M2", "STEP", true), finalRecord("M3", "REASON", true), finalRecord("M4", "ERROR", false, ["TERM"]), finalRecord("M5", "MATCH", false, ["NONE"])];
  const decision = approved.evaluatePrimaryFinal(records);
  assert.equal(decision.action, "repair_then_two_item_check");
  assert.equal(decision.recoveryQuestionIds.length, 2);
});
check("0-2/5 selects repair plus exactly three fresh items", () => {
  const records = [finalRecord("M1", "DIRECT", true), finalRecord("M2", "STEP", true), finalRecord("M3", "REASON", false, ["NONE"]), finalRecord("M4", "ERROR", false, ["TERM"]), finalRecord("M5", "MATCH", false, ["UNKNOWN"])];
  const decision = approved.evaluatePrimaryFinal(records);
  assert.equal(decision.action, "repair_then_three_item_final");
  assert.equal(decision.recoveryQuestionIds.length, 3);
});
check("recovery passes only when every required answer is clean and locked", () => {
  const clean = [finalRecord("RM1-DIRECT", "DIRECT", true), finalRecord("RM3-REASON", "REASON", true)];
  assert.equal(approved.recoveryRoutePasses({ requiredQuestionIds: ["RM1-DIRECT", "RM3-REASON"], records: clean }), true);
  assert.equal(approved.recoveryRoutePasses({ requiredQuestionIds: ["RM1-DIRECT", "RM3-REASON", "RM4-ERROR"], records: clean }), false);
});
check("completion never hard-codes FRA-26", () => {
  assert.ok(!JSON.stringify(spec.completion).includes("FRA-26"));
  assert.deepEqual(plain(spec.completion.secure.buttons), ["Back to Fractions", "Start again"]);
});
check("FRA25-HANDOFF-V1 migration and same-version audio-boundary reset are isolated", () => {
  const extension = fs.readFileSync(path.join(site, "public/fractions/js/fra25-engine-extension.js"), "utf8");
  ["FRA25-HANDOFF-V1", "content_version_migration", "narrationResume = null", "fra25FinalRecovery", "fra25RepairRecheck"].forEach((token) => assert.ok(extension.includes(token), token));
});
check("the active page loads FRA25 source, adapter, visuals and extensions", () => {
  const html = fs.readFileSync(path.join(site, "public/fractions/index.html"), "utf8");
  const earlyBootstrap = fs.readFileSync(path.join(site, "public/fractions/js/topics.js"), "utf8");
  ["fra25-approved-spec.js", "fra25-canonical.js", "fra25-visuals.js", "fra25-bootstrap.js", "fra25-engine-extension.js"].forEach((asset) => assert.ok(html.includes(asset) || earlyBootstrap.includes(asset), asset));
});
check("mobile inputs and reduced-motion presentation retain usable equivalents", () => {
  const css = fs.readFileSync(path.join(site, "public/fractions/fra25.css"), "utf8");
  assert.ok(css.includes("grid-template-rows: auto 2px auto"));
  assert.ok(css.includes("min-height: 48px"));
  assert.ok(css.includes("@media (max-width: 520px)"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes("animation: none"));
});
check("manifest keeps the existing active FRA-25 route entry", () => {
  const manifest = fs.readFileSync(path.join(site, "public/FRA 01 to 28/revily_fractions_v1_2/FRACTIONS_MANIFEST.yaml"), "utf8");
  assert.ok(manifest.includes("id: FRA-25"));
  assert.ok(manifest.includes("file: skills/FRA-25_COMPLETE_v1.2.yaml"));
});

process.stdout.write(`\nFRA-25 contract suite passed: ${checks} checks.\n`);
