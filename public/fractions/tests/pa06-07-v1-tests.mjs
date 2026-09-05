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

const manifestPath = "CUR-N04_Percentage_Amounts_v1_0/PERCENTAGE_AMOUNTS_MANIFEST.yaml";
const manifest = context.jsyaml.load(read(manifestPath));
const topic = context.RevilyTopics.find("percentage-amounts");

assert(topic, "percentage topic is registered");
assert.equal(topic.expectedSkillCount, 15);
assert.equal(manifest.skills.length, 15);
assert.deepEqual(Array.from(manifest.skills.map((entry) => entry.id)), Array.from({ length: 15 }, (_, index) => `PA-${String(index + 1).padStart(2, "0")}`));
assert.equal(context.RevilySkillLoader.inspectManifest(manifest, topic).length, 0);

const specs = new Map();
for (const entry of manifest.skills.slice(5, 7)) {
  const path = `CUR-N04_Percentage_Amounts_v1_0/${entry.file}`;
  const spec = context.jsyaml.load(read(path));
  specs.set(entry.id, spec);

  assert.equal(context.RevilySkillLoader.inspectSkill(spec, entry, manifest).length, 0, `${entry.id} fails loader inspection`);
  assert.equal(spec.identity.id, entry.id);
  assert.equal(spec.spec_intent.implementation_status, "production_batch_2");
  assert.equal(spec.lesson.teaching_steps.length, 10, `${entry.id} should have ten deliberate teaching scenes`);
  assert.equal(spec.lesson.teaching_steps.filter((step) => step.learner_interaction?.question_ref).length, 3, `${entry.id} should have three teaching checkpoints`);
  assert.deepEqual(Array.from(Object.keys(spec.lesson.transfer_steps)), ["G01", "F01", "I01"]);
  assert.equal(spec.lesson.practice.question_order.length, 5);
  assert.equal(spec.lesson.exit.primary_question_refs.length, 2);
  assert.equal(spec.lesson.exit.confirmation_question_refs.length, 2);
  assert.equal(spec.question_bank.length, 18);
  assert.equal(spec.diagnostic.enabled, false);
  assert.equal(spec.diagnostic.question_refs.length, 0);
  assert.equal(spec.retrieval_practice, undefined);
  assert.equal(spec.experience_contract.authored_feedback_only, true);
  assert.equal(spec.voice_and_script.narration_playback.mode, "browser_speech_ryan");
  assert.equal(spec.voice_and_script.narration_playback.require_ryan_voice, true);

  const model = context.RevilyLessonModel.buildLessonModel(spec);
  assert.equal(model.primaryPrimitive, "percentage_strip");
  assert.equal(model.nodes.length, 20);
  assert.equal(model.firstId, "T01");
  assert(model.getNode("G01") && model.getNode("F01") && model.getNode("I01"));

  for (const question of spec.question_bank) {
    assert(["single_choice", "decimal"].includes(question.response.type), `${question.id} uses an unsupported response type`);
    if (question.response.type === "single_choice") {
      assert.equal(question.response.options.length, 4, `${question.id} should expose exactly four choices`);
      assert(question.response.options.includes(question.answer.value), `${question.id} authored answer is not one of its choices`);
    }
    assert(context.RevilyValidators.validate(question, question.answer.value), `${question.id} rejects its authored answer`);
    const wrong = question.response.type === "single_choice"
      ? question.response.options.find((option) => String(option) !== String(question.answer.value))
      : String(Number(question.answer.value) + 1);
    assert(!context.RevilyValidators.validate(question, wrong), `${question.id} accepts an incorrect response`);
    if (question.response.type === "decimal") {
      const answerText = String(question.answer.value);
      const equivalent = answerText.includes(".") ? `${answerText}0` : `${answerText}.0`;
      assert(context.RevilyValidators.validate(question, equivalent), `${question.id} rejects equivalent trailing-zero notation`);
    }
    assert.equal(question.visual.primitive, "percentage_strip");
    assert(question.visual.model.solutionLabel, `${question.id} has no resolved-state visual label`);

    const evidenceOnly = ["exit", "confirmation"].includes(question.stage);
    if (evidenceOnly) {
      assert.equal(question.attempt_policy.max_attempts_before_resolution, 1);
      assert.equal(question.mathematical_support.hint_1, null);
      assert.equal(question.mathematical_support.hint_2, null);
    } else {
      assert.equal(question.attempt_policy.max_attempts_before_resolution, 2);
      for (const key of ["on_correct_reaction", "on_correct_math", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "worked_explanation"]) {
        assert(question.scripts[key], `${question.id} is missing ${key}`);
      }
      assert.notEqual(question.scripts.on_correct_reaction, question.scripts.on_incorrect_attempt_1, `${question.id} has indistinct correct and incorrect reactions`);
    }

    const host = { className: "", innerHTML: "", style: { setProperty() {} }, setAttribute() {} };
    context.RevilyVisuals.render(host, question.visual, { spec, question, feedback: "initial" });
    assert(!host.innerHTML.includes('class="percentage-solution"'), `${question.id} leaks its solution before submission`);
    assert(!host.innerHTML.includes('class="percentage-method-steps"'), `${question.id} leaks its method before submission`);
    context.RevilyVisuals.render(host, question.visual, { spec, question, feedback: "support" });
    assert(host.innerHTML.includes('class="percentage-solution"'), `${question.id} does not reveal its solution after support`);
    assert(host.innerHTML.includes('class="percentage-method-steps"'), `${question.id} does not reveal sequential working after support`);
  }
}

const pa06 = specs.get("PA-06");
assert.deepEqual(Array.from(pa06.dependencies.required_skill_refs), ["PA-01", "PA-02", "PA-05"]);
assert(pa06.concept_model.mathematical_rule.includes("(A ÷ 10) ÷ 2"));
for (const question of pa06.question_bank) {
  assert.equal(question.visual.model.partitionCount, 20, `${question.id} does not show twenty equal 5% cells`);
  assert.equal(question.visual.model.majorEvery, 2, `${question.id} does not pair 5% cells into 10% groups`);
}
let host = { className: "", innerHTML: "", style: { setProperty() {} }, setAttribute() {} };
const pa06Scene = context.RevilyLessonModel.buildLessonModel(pa06).getNode("T02");
context.RevilyVisuals.render(host, pa06Scene.visual, { spec: pa06, narration: pa06Scene.narration, feedback: "initial" });
assert(host.innerHTML.includes("--partitions:20"), "PA-06 does not render twenty equal 5% cells");
assert(host.innerHTML.includes("--major-partitions:10"), "PA-06 does not visually pair 5% cells into ten 10% groups");
assert(host.innerHTML.includes("has-major-groups"), "PA-06 paired benchmark styling is absent");
assert(host.innerHTML.includes("--percentage:35%"), "PA-06 opening build does not select 35%");

const pa07 = specs.get("PA-07");
assert.deepEqual(Array.from(pa07.dependencies.required_skill_refs), ["PA-01", "PA-02", "PA-03", "PA-04", "PA-05", "PA-06"]);
assert(pa07.concept_model.mathematical_rule.includes("subtraction routes"));
host = { className: "", innerHTML: "", style: { setProperty() {} }, setAttribute() {} };
const pa07Model = context.RevilyLessonModel.buildLessonModel(pa07);
const pa07Scene = pa07Model.getNode("T01");
context.RevilyVisuals.render(host, pa07Scene.visual, { spec: pa07, narration: pa07Scene.narration, feedback: "initial" });
const gridMarkup = host.innerHTML.match(/<div class="percentage-hundred-grid"[^>]*>(.*?)<\/div>/s)?.[1] || "";
assert.equal((gridMarkup.match(/<span/g) || []).length, 100, "PA-07 opening model does not contain one hundred equal cells");
assert.equal((gridMarkup.match(/class="is-selected"/g) || []).length, 32, "PA-07 opening model does not select exactly 32 cells");
const routesScene = pa07Model.getNode("T08");
context.RevilyVisuals.render(host, routesScene.visual, { spec: pa07, narration: routesScene.narration, feedback: "initial" });
assert.equal((host.innerHTML.match(/class="percentage-panel"/g) || []).length, 2, "PA-07 does not show two valid routes side by side");
assert.equal((host.innerHTML.match(/--percentage:68%/g) || []).length, 4, "PA-07 routes do not finish at the same 68% boundary");

const populationMap = context.jsyaml.load(read("docs/REVILY_CURRICULUM_POPULATION_MAP.yaml"));
const mappedSkills = populationMap.topics.flatMap((mappedTopic) => mappedTopic.skills);
const wavedSkills = Object.values(populationMap.rollout_waves).flatMap((wave) => wave.skills);
assert.equal(mappedSkills.length, 78, "population map does not contain all 78 skills");
assert.equal(new Set(mappedSkills.map((skill) => skill.id)).size, 78, "population map repeats a skill id");
assert.equal(wavedSkills.length, 78, "rollout waves do not account for all 78 skills");
assert.equal(new Set(wavedSkills).size, 78, "a skill appears in more than one rollout wave");
assert.equal(mappedSkills.filter((skill) => skill.status === "production").length, 78, "population map production count is not seventy-eight");

for (const [sourcePath, mirrorPath] of [
  ["fractions/js/topics.js", "revily-site/public/fractions/js/topics.js"],
  ["fractions/js/visual-primitives.js", "revily-site/public/fractions/js/visual-primitives.js"],
  ["fractions/styles.css", "revily-site/public/fractions/styles.css"],
  [manifestPath, `revily-site/public/${manifestPath}`],
  ...[6, 7].map((number) => [
    `CUR-N04_Percentage_Amounts_v1_0/skills/PA-0${number}_COMPLETE_v1.2.yaml`,
    `revily-site/public/CUR-N04_Percentage_Amounts_v1_0/skills/PA-0${number}_COMPLETE_v1.2.yaml`
  ])
]) {
  assert.equal(digest(sourcePath), digest(mirrorPath), `${sourcePath} and hosted mirror differ`);
}

console.log("PA-06 and PA-07 contracts, pedagogy, validation, visuals, population map and mirrors passed.");
