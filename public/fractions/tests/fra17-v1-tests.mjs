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
  const specPath = path.join(workspace, "LessonSpec.ts");
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

const approved = compileApprovedSpec();
const context = { window: {}, console };
vm.createContext(context);
for (const relative of [
  "fractions/js/fra17-approved-spec.js",
  "fractions/js/fra17-canonical.js",
  "fractions/js/fra17-visuals.js",
  "fractions/js/lesson-model.js"
]) {
  const filename = path.join(workspace, relative);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
}
const adapter = context.window.RevilyFra17Canonical;
const runtime = context.window.FRA17_RUNTIME_COPY;
const legacy = yaml.load(fs.readFileSync(path.join(workspace, "FRA 01 to 28/revily_fractions_v1_2/skills/FRA-17_COMPLETE_v1.2.yaml"), "utf8"));
const spec = adapter.apply(structuredClone(legacy));
const model = context.window.RevilyLessonModel.buildLessonModel(spec);
const question = (id) => spec.question_bank.find((item) => item.canonicalQuestionId === id);

check("approved TypeScript validates", () => assert.equal(approved.validateFRA17LessonSpec().length, 0));
check("runtime registry contains the approved 80 utterances", () => assert.equal(Object.keys(runtime).length, 80));
check("adapter runtime contract validates", () => assert.equal(adapter.validateRuntimeContract().length, 0));
check("active identity and content version are canonical FRA-17", () => {
  assert.equal(spec.identity.id, "FRA-17");
  assert.equal(spec.identity.title, "Add Fractions with the Same Denominator");
  assert.equal(spec.canonical_lesson.version, "fra17-same-denominator-addition-v1");
});
check("no Diagnostic or Retrieval layer is enabled", () => {
  assert.equal(spec.diagnostic.enabled, false);
  assert.equal(spec.retrieval_practice.enabled, false);
  assert.deepEqual(plain(spec.diagnostic.question_refs), []);
  assert.deepEqual(plain(spec.retrieval_practice.question_refs), []);
});
check("exact teaching order preserves concept before rule", () => {
  assert.deepEqual(plain(spec.lesson.teaching_steps.map((step) => step.id)), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "HANDOFF"]);
});
check("exact guided-faded-independent-final node order is wired", () => {
  assert.deepEqual(plain(model.nodes.map((node) => node.id)), ["HOOK", "HOOK-CHOICE", "T1", "T2", "T3", "T4", "HANDOFF", "G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4"]);
});
check("eight-section hook and 5/16 conflict are preserved", () => {
  const hook = approved.FRA17_LESSON_SPEC.conceptualTeaching.scenes[0];
  assert.equal(hook.visual.denominator, 8);
  assert.deepEqual(plain(hook.visual.wrongClaim), { numerator: 5, denominator: 16 });
});
check("every cue references an exact registry utterance anchor", () => {
  approved.FRA17_LESSON_SPEC.conceptualTeaching.scenes.flatMap((scene) => scene.timedVisualEvents || []).forEach((cue) => {
    assert.ok(runtime[cue.utteranceId]);
    assert.ok(runtime[cue.utteranceId].text.toLowerCase().includes(cue.anchorText.toLowerCase()));
  });
});
check("every authored teaching cue target exists in its rendered scene", () => {
  approved.FRA17_LESSON_SPEC.conceptualTeaching.scenes.forEach((scene) => {
    const markup = context.window.RevilyFra17Visuals.renderMarkup(null, {
      feedback: "initial",
      question: { model: { context: "fra17", sceneId: scene.id, visual: scene.visual } }
    });
    scene.timedVisualEvents.flatMap((event) => event.targetIds).forEach((targetId) => {
      assert.ok(markup.includes(`id="${targetId}"`), `${scene.id}: ${targetId}`);
    });
  });
});
check("all adapter narration is registry-owned", () => {
  spec.question_bank.flatMap((item) => item.runtimeUtteranceIds || []).forEach((id) => assert.ok(runtime[id], id));
  spec.lesson.teaching_steps.flatMap((step) => step.narration?.script || []).forEach((line) => assert.ok(spec.canonical_lesson.runtime_copy_text_to_id[line], line));
});
check("Ryan live-speech mode and word-boundary captions are required", () => {
  assert.equal(spec.voice_and_script.narration_playback.mode, "browser_speech_ryan");
  assert.equal(spec.voice_and_script.narration_playback.require_ryan_voice, true);
  assert.equal(spec.voice_and_script.caption_presentation.mode, "on_canvas_progressive");
});
check("all authored fraction items stay proper and simplest", () => {
  const items = [
    ...approved.FRA17_LESSON_SPEC.guidedPractice,
    ...approved.FRA17_LESSON_SPEC.fadedPractice,
    ...approved.FRA17_LESSON_SPEC.independentPractice,
    ...approved.FRA17_LESSON_SPEC.confirmations,
    ...approved.FRA17_LESSON_SPEC.finalCheck.items,
    ...approved.FRA17_LESSON_SPEC.repairs.flatMap((repair) => [repair.supportedInteraction, repair.freshIndependentRecheck]),
    ...approved.FRA17_LESSON_SPEC.adaptivity.recoveryProfiles.flatMap((profile) => profile.deterministicFallbackItems)
  ];
  items.filter((item) => item.answer.kind === "fraction").forEach((item) => {
    const value = item.answer.value;
    assert.ok(value.numerator < value.denominator, item.id);
    assert.equal(approved.gcd(value.numerator, value.denominator), 1, item.id);
  });
});
check("exact original-denominator answer is accepted", () => {
  const result = adapter.evaluateResponse(question("G2"), { n: "6", d: "11" });
  assert.equal(result.correct, true);
  assert.equal(result.formCorrect, true);
});
check("equivalent changed-denominator value is separated from required form", () => {
  const result = adapter.evaluateResponse(question("G2"), { n: "12", d: "22" });
  assert.equal(result.correct, false);
  assert.equal(result.valueCorrect, true);
  assert.equal(result.formCorrect, false);
  assert.equal(result.errorFamily, "FORM_MISMATCH");
});
check("denominator-add response is observable but initially unstable", () => {
  assert.equal(adapter.classifyErrorFamily(question("G2"), { n: "6", d: "22" }), "DEN_ADD");
  assert.equal(adapter.requiresRepeatedEvidence(question("G2"), { n: "6", d: "22" }), true);
});
check("copied-numerator response is classified", () => assert.equal(adapter.classifyErrorFamily(question("G2"), { n: "4", d: "11" }), "NUM_COPY"));
check("visual miscount is distinct from arithmetic", () => assert.equal(adapter.classifyErrorFamily(question("G1"), "4"), "VIS_COUNT"));
check("same-denominator symbolic slip is arithmetic", () => assert.equal(adapter.classifyErrorFamily(question("G2"), { n: "7", d: "11" }), "ARITHMETIC"));
check("malformed response is neutral validation", () => assert.equal(adapter.classifyErrorFamily(question("G2"), { n: "x", d: "11" }), "MALFORMED"));
check("correct and denominator-add outcome branches are distinct", () => {
  assert.deepEqual(plain(adapter.selectOutcomeUtteranceIds(question("G2"), { n: "6", d: "11" }, true)), ["G2.CORRECT"]);
  assert.deepEqual(plain(adapter.selectOutcomeUtteranceIds(question("G2"), { n: "6", d: "22" }, false)), ["G2.INCORRECT.DEN_ADD"]);
});

const clean = { firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false };
check("strong guided evidence skips F1", () => assert.equal(adapter.shouldSkipF1({ g1: clean, g2: clean, centralErrorSignals: [] }), true));
check("F2 is retained on the fast route", () => assert.deepEqual(plain(spec.lesson.adaptive_pathway.skip_after.G2), { type: "fra17_guided_strong", questionRefs: ["FRA-17-G1", "FRA-17-G2"], next: "F2", otherwise: "F1" }));
check("G1 miss prevents the fast route", () => assert.equal(adapter.shouldSkipF1({ g1: { ...clean, firstAttemptCorrect: false }, g2: clean, centralErrorSignals: [] }), false));
check("G2 miss prevents the fast route", () => assert.equal(adapter.shouldSkipF1({ g1: clean, g2: { ...clean, firstAttemptCorrect: false }, centralErrorSignals: [] }), false));
check("support escalation prevents the fast route", () => assert.equal(adapter.shouldSkipF1({ g1: clean, g2: { ...clean, supportEscalated: true }, centralErrorSignals: [] }), false));
check("central denominator evidence prevents the fast route", () => assert.equal(adapter.shouldSkipF1({ g1: clean, g2: clean, centralErrorSignals: ["DEN_ADD"] }), false));
check("response speed is absent from the fast-route inputs", () => assert.ok(!adapter.shouldSkipF1.toString().includes("speed")));
check("all optional-hint items have authored fresh confirmations", () => {
  ["F1", "F2", "I1", "I2"].forEach((id) => assert.ok(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question[`FRA-17-${id}`], id));
});
check("I1 and I2 use their approved matching confirmations", () => {
  assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question["FRA-17-I1"], "FRA-17-C-I1");
  assert.equal(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question["FRA-17-I2"], "FRA-17-C-I2");
});
check("each stable repair has an intro, supported interaction and fresh recheck", () => {
  approved.FRA17_LESSON_SPEC.repairs.forEach((repair) => {
    const converted = question(repair.id);
    assert.equal(converted.supportedInteractionId, `FRA-17-${repair.supportedInteraction.id}`);
    assert.equal(converted.freshCheckId, `FRA-17-${repair.freshIndependentRecheck.id}`);
    assert.ok(question(repair.supportedInteraction.id));
    assert.ok(question(repair.freshIndependentRecheck.id));
  });
});
check("visual supported repair requires the exact seven selected cells", () => {
  const item = question("R-VIS-SUPPORTED");
  assert.equal(adapter.evaluateResponse(item, { numerator: "7", tapped: ["0", "1", "2", "3", "4", "5", "6"] }).correct, true);
  assert.equal(adapter.evaluateResponse(item, { numerator: "7", tapped: ["0", "1", "2", "3", "4", "5", "9"] }).correct, false);
});

const finalRecord = (id, correct = true) => ({ questionId: `FRA-17-${id}`, firstAttemptCorrect: correct, countsAsIndependentEvidence: true });
check("3/4 with M1 and conceptual coverage finishes", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("M2"), finalRecord("M3"), finalRecord("M4", false)], false), "finish_candidate"));
check("4/4 finishes", () => assert.equal(adapter.routeFinal(["M1", "M2", "M3", "M4"].map((id) => finalRecord(id)), false), "finish_candidate"));
check("3/4 without M1 routes to two fresh items", () => assert.equal(adapter.routeFinal([finalRecord("M1", false), finalRecord("M2"), finalRecord("M3"), finalRecord("M4")], false), "targeted_repair_then_two_item_check"));
check("threshold met without conceptual coverage routes to two fresh items", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("DIRECT-EXTRA"), finalRecord("M2", false), finalRecord("M3", false), finalRecord("M4", false)], false), "targeted_repair_then_two_item_check"));
check("2/4 routes to a two-item mini-check", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("M2"), finalRecord("M3", false), finalRecord("M4", false)], false), "targeted_repair_then_two_item_check"));
check("0-1/4 routes to a fresh four-item final", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("M2", false), finalRecord("M3", false), finalRecord("M4", false)], false), "targeted_repair_then_fresh_four_item_final"));
check("repeated unresolved denominator evidence blocks direct finish", () => assert.equal(adapter.routeFinal([finalRecord("M1"), finalRecord("M2"), finalRecord("M3")], true), "targeted_repair_then_two_item_check"));
check("two-item recovery always includes direct and conceptual families", () => {
  const ids = adapter.selectRecoveryQuestionIds(2);
  assert.deepEqual(plain(ids), ["FRA-17-REC-2-DIRECT", "FRA-17-REC-2-REASON"]);
});
check("seen recovery reasoning is replaced without losing coverage", () => {
  const ids = adapter.selectRecoveryQuestionIds(2, ["FRA-17-REC-2-REASON"]);
  assert.equal(question(ids[0].replace("FRA-17-", "")).evidenceFamily, "DIRECT");
  assert.notEqual(question(ids[1].replace("FRA-17-", "")).evidenceFamily, "DIRECT");
});
check("four-item recovery is the approved fresh final", () => assert.deepEqual(plain(adapter.selectRecoveryQuestionIds(4)), ["FRA-17-REC-4-DIRECT", "FRA-17-REC-4-VIS", "FRA-17-REC-4-CONTEXT", "FRA-17-REC-4-ERROR"]));
check("all primary final answers lock before working", () => spec.lesson.exit.primary_question_refs.forEach((id) => {
  const item = spec.question_bank.find((candidate) => candidate.id === id);
  assert.equal(item.policy.answerLocksOnSubmit, true);
  assert.equal(item.policy.solutionPolicy, "after_locked_submit");
  assert.ok(item.scripts.worked_steps.length >= 3);
}));
check("completion has no hard-coded next lesson", () => {
  const text = JSON.stringify(spec.completion);
  assert.ok(!text.includes("FRA-18"));
  assert.ok(!text.includes("FRA-19"));
  assert.deepEqual(plain(spec.completion.secure.buttons), ["Back to Fractions", "Start again"]);
});
check("active page loads FRA-17 assets", () => {
  const html = fs.readFileSync(path.join(workspace, "fractions/index.html"), "utf8");
  ["fra17-approved-spec.js", "fra17-canonical.js", "fra17-visuals.js"].forEach((asset) => assert.ok(html.includes(asset), asset));
});
check("engine includes isolated FRA-17 migration, form evidence and recovery hooks", () => {
  const engine = fs.readFileSync(path.join(workspace, "fractions/js/lesson-engine.js"), "utf8");
  ["fra17-same-denominator-addition-v1", "answerValueCorrect", "fra17FinalRecovery", "supportedInteractionId"].forEach((token) => assert.ok(engine.includes(token), token));
});

process.stdout.write(`\nFRA-17 contract suite passed: ${checks} checks.\n`);
