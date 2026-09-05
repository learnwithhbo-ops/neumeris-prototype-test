import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(testDir, "../..");
const nodeModules = path.join(workspaceRoot, "revily-site/node_modules");
const ts = await import(pathToFileURL(path.join(nodeModules, "typescript/lib/typescript.js")).href);
const yaml = await import(pathToFileURL(path.join(nodeModules, "js-yaml/index.js")).href);

function loadTypeScriptSpec() {
  const filename = path.join(workspaceRoot, "FRA06_CANONICAL_SPEC.ts");
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true },
    fileName: filename,
    reportDiagnostics: true
  });
  const errors = (compiled.diagnostics || []).filter((item) => item.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, "\n")).join("\n"));
  const record = { exports: {} };
  vm.runInNewContext(compiled.outputText, { exports: record.exports, module: record }, { filename });
  return record.exports;
}

const canonical = loadTypeScriptSpec();
assert.equal(canonical.validateFRA06CanonicalSpec().length, 0, "validateFRA06CanonicalSpec() must return zero errors");
assert.equal(Object.keys(canonical.FRA06_RUNTIME_COPY).length, 139, "runtime registry count changed");

const browserContext = { window: {} };
vm.createContext(browserContext);
vm.runInContext(fs.readFileSync(path.join(workspaceRoot, "fractions/js/fra06-approved-spec.js"), "utf8"), browserContext);
assert.deepEqual(JSON.parse(JSON.stringify(browserContext.window.FRA06_RUNTIME_COPY)), JSON.parse(JSON.stringify(canonical.FRA06_RUNTIME_COPY)), "generated runtime copy differs from the TypeScript source");
assert.deepEqual(JSON.parse(JSON.stringify(browserContext.window.RevilyFra06Approved)), JSON.parse(JSON.stringify(canonical.FRA06)), "generated lesson data differs from the TypeScript source");
vm.runInContext(fs.readFileSync(path.join(workspaceRoot, "fractions/js/fra06-canonical.js"), "utf8"), browserContext);
vm.runInContext(fs.readFileSync(path.join(workspaceRoot, "fractions/js/fra06-visuals.js"), "utf8"), browserContext);

const adapter = browserContext.window.RevilyFra06Canonical;
assert.equal(adapter.validateRuntimeContract().length, 0, "runtime/caption/cue contract failed");
const questions = adapter.buildQuestions();
assert.equal(questions.length, 25, "canonical runtime bank must contain hook, 10 main items, 9 confirmations, 4 repairs and the mixed repair check");

const legacyYaml = fs.readFileSync(path.join(workspaceRoot, "FRA 01 to 28/revily_fractions_v1_2/skills/FRA-06_COMPLETE_v1.2.yaml"), "utf8");
const spec = adapter.apply(yaml.load(legacyYaml));
assert.equal(spec.identity.version, "fra06-handoff-v1-runtime-copy-1");
assert.equal(spec.canonical_lesson.engine_profile, "fra06");
assert.equal(spec.lesson.teaching_steps.map((step) => step.id).join("|"), "HOOK|HOOK-CHOICE|T1|T2|T3|T4|T5");
assert.equal(spec.lesson.practice.question_order.length, 0, "legacy quota practice remains reachable");
assert.equal(spec.lesson.exit.primary_question_refs.join("|"), "FRA-06-M1|FRA-06-M2|FRA-06-M3|FRA-06-M4");
assert.equal(spec.lesson.exit.confirmation_question_refs.length, 10);
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.next, "F2");
assert.equal(spec.lesson.adaptive_pathway.skip_after.G2.otherwise, "F1");
assert.equal(spec.lesson.adaptive_pathway.no_hint_gate_after.nodeId, "I2");
assert.equal(spec.lesson.exit.mastery_policy.secureMinimum, 3);
assert.equal(spec.lesson.exit.mastery_policy.twoCorrectRequiredFreshSuccesses, 2);
assert.equal(spec.lesson.exit.mastery_policy.zeroOrOneCorrectRequiredFreshSuccesses, 4);

const registry = canonical.FRA06_RUNTIME_COPY;
const registryTexts = new Set(Object.values(registry).map((entry) => entry.text));
const cues = spec.lesson.teaching_steps.flatMap((step) => step.narration.sync_cues || []);
assert.equal(cues.length, 34, "approved cue count changed");
cues.forEach((cue) => {
  assert.ok(registry[cue.utteranceId], `${cue.id} points to a missing utterance`);
  assert.ok(registry[cue.utteranceId].text.includes(cue.anchorText), `${cue.id} anchor is not spoken by Ryan`);
});

const speakableKeys = ["before_submit", "on_correct_reaction", "on_incorrect_reaction", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "worked_narration", "reteach"];
const speakable = [
  ...spec.lesson.teaching_steps.flatMap((step) => step.narration.script || []),
  ...spec.question_bank.flatMap((question) => speakableKeys.flatMap((key) => question.scripts?.[key] || [])),
  ...spec.question_bank.flatMap((question) => Object.values(question.scripts?.response_feedback || {})),
  ...spec.question_bank.flatMap((question) => Object.values(question.scripts?.family_feedback || {})),
  ...spec.question_bank.flatMap((question) => Object.values(question.scripts?.engagement_response_by_value || {})),
  ...spec.lesson.exit.intro_script,
  ...spec.completion.secure.ryan_script
].flat(Infinity).filter(Boolean);
assert.ok(speakable.every((line) => registryTexts.has(line)), "non-registry text can reach Ryan or captions");
assert.equal(new Set(speakable).size, registryTexts.size, "one or more approved runtime utterances are unreachable");
assert.ok(!speakable.some((line) => spec.question_bank.some((question) => question.prompt === line)), "a visible prompt can reach Ryan");

const hookProper = adapter.getHookResponseSequence("proper_card");
const hookImproper = adapter.getHookResponseSequence("improper_card");
const hookMixed = adapter.getHookResponseSequence("mixed_card");
assert.equal(hookProper.join("|"), "HOOK.FEEDBACK.WRONG_PROPER|HOOK.REVEAL.1");
assert.equal(hookImproper.join("|"), "HOOK.FEEDBACK.WRONG_IMPROPER|HOOK.REVEAL.1");
assert.equal(hookMixed.join("|"), "HOOK.FEEDBACK.CORRECT|HOOK.REVEAL.1");

for (const id of ["M1", "M2", "M3", "M4"]) {
  const question = questions.find((item) => item.id === `FRA-06-${id}`);
  assert.equal(question.policy.hintPolicy, "none", `${id} exposes a hint`);
  assert.equal(question.policy.answerLocksOnSubmit, true, `${id} does not lock on submit`);
  assert.equal(question.policy.solutionPolicy, "after_locked_submit", `${id} can reveal working before lock`);
  assert.ok(question.runtimeOutcome.correctUtteranceIds.length === 1);
  assert.ok(question.runtimeOutcome.incorrectDefaultUtteranceIds.length === 1);
  assert.ok(question.scripts.worked_narration.length >= 2);
}

const m3 = questions.find((item) => item.id === "FRA-06-M3");
const m3BeforeSubmit = browserContext.window.RevilyFra06Visuals.renderMarkup({}, { question: m3, feedback: "initial" });
const m3CorrectFeedback = browserContext.window.RevilyFra06Visuals.renderMarkup({}, { question: m3, feedback: "correct" });
const m3Worked = browserContext.window.RevilyFra06Visuals.renderMarkup({}, { question: m3, feedback: "worked" });
assert.doesNotMatch(m3BeforeSubmit, /fra06-bars|fra06-whole-bar/, "M3 reveals its model before submission");
assert.doesNotMatch(m3CorrectFeedback, /fra06-bars|fra06-whole-bar/, "M3 reveals its model during outcome feedback");
assert.equal((m3Worked.match(/fra06-whole-bar is-full/g) || []).length, 4, "M3 worked reveal does not show four complete wholes");
assert.equal((m3Worked.match(/class="is-selected"/g) || []).length, 3, "M3 worked reveal does not show three tenths of the next whole");

const m1 = questions.find((item) => item.id === "FRA-06-M1");
const m1Worked = browserContext.window.RevilyFra06Visuals.renderMarkup({}, { question: m1, feedback: "worked" });
assert.match(m1Worked, /class="fra06-point"[^>]*aria-hidden="true"><i>P<\/i>/, "FRA06 number-line point is not visibly identified as P");

assert.equal(spec.lesson.adaptive_pathway.repair_by_error_family.proper_boundary, "FRA-06-R-PROPER");
assert.equal(spec.lesson.adaptive_pathway.repair_by_error_family.improper_invalid, "FRA-06-R-INVALID");
assert.equal(spec.lesson.adaptive_pathway.repair_by_error_family.exact_one, "FRA-06-R-EQUAL");
assert.equal(spec.lesson.adaptive_pathway.repair_by_error_family.mixed_form, "FRA-06-R-MIXED");

const styles = fs.readFileSync(path.join(workspaceRoot, "fractions/styles.css"), "utf8");
assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.fra06-context-visual[\s\S]*?animation:\s*none\s*!important/,
  "FRA06 has no reduced-motion fallback");
assert.match(styles, /\.classification-sort-row select[\s\S]*?min-height:\s*44px/,
  "FRA06 sort selectors do not guarantee a 44px touch target");
assert.match(styles, /\.fra06-hook[^}]*width:\s*100%/, "FRA06 visual layouts can still shrink-wrap their number lines");
assert.match(styles, /\.fra06-line\s*{[^}]*width:\s*calc\(100%\s*-\s*3rem\)[^}]*max-width:\s*860px/, "FRA06 number lines do not use the approved elongated layout");

console.log("FRA06 contract tests passed: canonical validation, runtime/caption/cue parity, routes, repairs, final locking and migration version.");
