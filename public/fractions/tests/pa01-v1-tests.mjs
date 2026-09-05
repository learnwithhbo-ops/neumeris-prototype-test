import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const digest = (path) => crypto.createHash("sha256").update(read(path)).digest("hex");

const context = { console };
context.window = context;
context.self = context;
context.globalThis = context;
vm.createContext(context);

for (const path of [
  "fractions/vendor/js-yaml.min.js",
  "fractions/js/topics.js",
  "fractions/js/skill-loader.js",
  "fractions/js/validators.js",
  "fractions/js/lesson-model.js",
  "fractions/js/visual-primitives.js"
]) {
  vm.runInContext(read(path), context, { filename: path });
}

const manifest = context.jsyaml.load(read("CUR-N04_Percentage_Amounts_v1_0/PERCENTAGE_AMOUNTS_MANIFEST.yaml"));
const spec = context.jsyaml.load(read("CUR-N04_Percentage_Amounts_v1_0/skills/PA-01_COMPLETE_v1.2.yaml"));
const topic = context.RevilyTopics.find("percentage-amounts");

assert(topic, "percentage topic is registered");
assert.equal(topic.expectedSkillCount, 15);
assert.equal(context.RevilySkillLoader.inspectManifest(manifest, topic).length, 0);
assert.equal(context.RevilySkillLoader.inspectSkill(spec, manifest.skills[0], manifest).length, 0);

assert.equal(spec.identity.id, "PA-01");
assert.equal(spec.lesson.teaching_steps.length, 10);
assert.equal(spec.lesson.teaching_steps.filter((step) => step.learner_interaction?.question_ref).length, 3);
assert.equal(spec.lesson.practice.question_order.length, 5);
assert.equal(spec.lesson.exit.primary_question_refs.length, 2);
assert.equal(spec.lesson.exit.confirmation_question_refs.length, 2);
assert.equal(spec.question_bank.length, 18);
assert.equal(spec.diagnostic.enabled, false);
assert.equal(spec.diagnostic.question_refs.length, 0);
assert.equal(spec.retrieval_practice, undefined);
assert.equal(spec.voice_and_script.narration_playback.mode, "browser_speech_ryan");

const model = context.RevilyLessonModel.buildLessonModel(spec);
assert.equal(model.primaryPrimitive, "percentage_strip");
assert.equal(model.nodes.length, 20);
assert.equal(model.firstId, "T01");
assert(model.getNode("G01") && model.getNode("F01") && model.getNode("I01"));

for (const question of spec.question_bank) {
  assert.equal(question.response.type, "single_choice", `${question.id} should use a keyboard/touch choice control`);
  assert(context.RevilyValidators.validate(question, question.answer.value), `${question.id} rejects its authored answer`);
  const wrong = question.response.options.find((option) => String(option) !== String(question.answer.value));
  assert(!context.RevilyValidators.validate(question, wrong), `${question.id} accepts a distractor`);
  assert.equal(question.visual.primitive, "percentage_strip");
  assert.notEqual(question.visual.model.showRoles, true, `${question.id} leaks role labels`);
  assert.notEqual(question.visual.model.showFormula, true, `${question.id} leaks its setup`);
  if (!["exit", "confirmation"].includes(question.stage)) {
    for (const key of ["on_correct_math", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "worked_explanation"]) {
      assert(question.scripts[key], `${question.id} is missing ${key}`);
    }
    assert.notEqual(question.scripts.on_correct_math, question.scripts.on_incorrect_attempt_1, `${question.id} has indistinct feedback`);
  }
}

for (const id of ["PA-01-E01", "PA-01-E02", "PA-01-CFM01", "PA-01-CFM02"]) {
  const question = model.getQuestion(id);
  assert.equal(question.attempt_policy.max_attempts_before_resolution, 1);
  assert.equal(question.mathematical_support.hint_1, null);
  assert.equal(question.mathematical_support.hint_2, null);
}

const question = model.getQuestion("PA-01-E01");
const host = {
  className: "",
  innerHTML: "",
  style: { setProperty() {} },
  setAttribute() {}
};
context.RevilyVisuals.render(host, question.visual, { spec, question, feedback: "initial" });
assert(!host.innerHTML.includes("Whole = 250"), "exit visual leaks the answer before submission");
context.RevilyVisuals.render(host, question.visual, { spec, question, feedback: "support" });
assert(host.innerHTML.includes("Whole = 250"), "resolved visual does not reveal the authored answer");

const comparisonScene = model.getNode("T08");
context.RevilyVisuals.render(host, comparisonScene.visual, { spec, narration: comparisonScene.narration, feedback: "initial" });
assert.equal((host.innerHTML.match(/class="percentage-panel"/g) || []).length, 2, "paired comparison does not render two percentage panels");
assert(host.innerHTML.includes("30% of 70") && host.innerHTML.includes("70% of 30"));

for (const [sourcePath, mirrorPath] of [
  ["fractions/js/topics.js", "revily-site/public/fractions/js/topics.js"],
  ["fractions/js/app.js", "revily-site/public/fractions/js/app.js"],
  ["fractions/js/visual-primitives.js", "revily-site/public/fractions/js/visual-primitives.js"],
  ["fractions/js/lesson-engine.js", "revily-site/public/fractions/js/lesson-engine.js"],
  ["fractions/styles.css", "revily-site/public/fractions/styles.css"],
  ["CUR-N04_Percentage_Amounts_v1_0/PERCENTAGE_AMOUNTS_MANIFEST.yaml", "revily-site/public/CUR-N04_Percentage_Amounts_v1_0/PERCENTAGE_AMOUNTS_MANIFEST.yaml"],
  ["CUR-N04_Percentage_Amounts_v1_0/skills/PA-01_COMPLETE_v1.2.yaml", "revily-site/public/CUR-N04_Percentage_Amounts_v1_0/skills/PA-01_COMPLETE_v1.2.yaml"]
]) {
  assert.equal(digest(sourcePath), digest(mirrorPath), `${sourcePath} and hosted mirror differ`);
}

console.log("PA-01 contract, pedagogy, validation, visuals and mirror checks passed.");
