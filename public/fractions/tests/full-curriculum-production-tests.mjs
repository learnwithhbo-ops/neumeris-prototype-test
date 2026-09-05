import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testsDir, "..", "..");
const publicRoot = path.join(root, "revily-site", "public");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "tmp", "pdfs", "revily-approved-source-corpus.json"), "utf8"));

const packs = [
  ["AF", "CUR-N01_Add_Subtract_Fractions_v1_0", "ADD_SUBTRACT_FRACTIONS_MANIFEST.yaml", 18],
  ["MD", "CUR-N02_Multiply_Divide_Fractions_v1_0", "MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml", 17],
  ["FDP", "CUR-N03_FDP_Conversions_v1_0", "FDP_CONVERSIONS_MANIFEST.yaml", 15],
  ["PA", "CUR-N04_Percentage_Amounts_v1_0", "PERCENTAGE_AMOUNTS_MANIFEST.yaml", 15],
  ["PC", "CUR-N05_Percentage_Change_v1_0", "PERCENTAGE_CHANGE_MANIFEST.yaml", 13],
];

const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const generatedIds = [];

for (const [code, folder, manifestFile, count] of packs) {
  const sourceManifestPath = path.join(root, folder, manifestFile);
  const publicManifestPath = path.join(publicRoot, folder, manifestFile);
  assert.equal(sha(sourceManifestPath), sha(publicManifestPath), `${code} manifest mirrors differ`);
  const manifest = readJson(sourceManifestPath);
  assert.equal(manifest.skills.length, count, `${code} manifest count`);
  assert.deepEqual(manifest.skills.map((entry) => entry.id), Array.from({ length: count }, (_, index) => `${code}-${String(index + 1).padStart(2, "0")}`), `${code} sequence`);

  for (const entry of manifest.skills) {
    if (code === "PA" && Number(entry.id.slice(-2)) <= 7) continue;
    generatedIds.push(entry.id);
    const sourceSpecPath = path.join(root, folder, entry.file);
    const publicSpecPath = path.join(publicRoot, folder, entry.file);
    assert.equal(sha(sourceSpecPath), sha(publicSpecPath), `${entry.id} mirrors differ`);
    const spec = readJson(sourceSpecPath);
    assert.equal(spec.schema_version, "1.2", `${entry.id} schema`);
    assert.equal(spec.identity.id, entry.id, `${entry.id} identity`);
    assert.equal(spec.identity.title, entry.title, `${entry.id} title`);
    assert.deepEqual([...spec.dependencies.required_skill_refs].sort(), [...entry.prerequisites].sort(), `${entry.id} prerequisites`);
    assert.ok(spec.lesson.teaching_steps.length > 0, `${entry.id} teaching present`);
    for (const stage of ['guided', 'faded', 'independent_transfer']) assert.ok(Object.values(spec.lesson.transfer_steps).some(step => step.stage === stage), `${entry.id} ${stage} present`);
    assert.ok(spec.lesson.practice.question_order.length > 0, `${entry.id} practice present`);
    assert.ok(spec.lesson.exit.primary_question_refs.length > 0, `${entry.id} final check present`);
    // Counts are source-specific. Structural presence is not a pedagogy audit.
    assert.equal(spec.diagnostic.enabled, false, `${entry.id} diagnostics remain out of scope`);
    assert.match(spec.spec_intent.excluded_from_active_route.join(" "), /Delayed retrieval/, `${entry.id} retrieval scope`);

    const source = corpus.topics[code].skills.find((record) => record.id === entry.id);
    assert.ok(source, `${entry.id} source packet indexed`);
    assert.equal(spec.spec_intent.source_material.sha256, source.sha256, `${entry.id} source checksum`);
    assert.equal(spec.spec_intent.source_material.authoritative_pages, `1-${source.page_count}`, `${entry.id} source page coverage`);
    assert.ok(source.pages.every((page) => page.text.trim().length > 0), `${entry.id} source pages are readable`);

    const ids = new Set(spec.question_bank.map((question) => question.id));
    assert.equal(ids.size, spec.question_bank.length, `${entry.id} unique question ids`);
    assert.equal(new Set(spec.question_bank.map((question) => question.prompt)).size, spec.question_bank.length, `${entry.id} no verbatim duplicate prompts`);
    for (const question of spec.question_bank) {
      assert.ok(question.scripts.on_correct_reaction, `${question.id} correct reaction`);
      assert.ok(question.scripts.on_correct_math, `${question.id} correct maths`);
      assert.ok(question.scripts.on_incorrect_attempt_1, `${question.id} first error feedback`);
      assert.ok(question.scripts.on_incorrect_attempt_2, `${question.id} second error feedback`);
      assert.ok(question.scripts.worked_explanation, `${question.id} worked explanation`);
      assert.ok(question.mathematical_support.hint_1, `${question.id} first hint`);
      assert.ok(question.mathematical_support.hint_2, `${question.id} second hint`);
      assert.ok(question.mathematical_support.worked_solution, `${question.id} worked solution`);
      assert.doesNotMatch(JSON.stringify(question.visual?.model || {}), /partAmount|solutionLabel|methodSteps/, `${question.id} visual model does not leak the result`);
      if (Number(question.visual?.model?.percent) > 100) {
        assert.notEqual(question.visual.primitive, "percentage_strip", `${question.id} does not clamp an above-100 percentage into one strip`);
      }
      assert.notEqual(question.scripts.on_correct_reaction, question.scripts.on_incorrect_attempt_1, `${question.id} answer-dependent feedback`);
    }
  }
}

assert.equal(generatedIds.length, 71, "all remaining approved lessons generated");
assert.equal(new Set(generatedIds).size, 71, "generated lesson ids unique");

const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "fractions", "js", "validators.js"), "utf8"), context);
const validators = context.window.RevilyValidators;

function definitelyWrong(question) {
  const type = question.response.type;
  if (type === "single_choice") return question.response.options.find((value) => value !== question.answer.value);
  if (type === "fraction") return { n: "99991", d: "99989" };
  if (type === "mixed_number") return { whole: "99991", n: "1", d: "2" };
  if (type === "integer") return String(Number(question.answer.value) + 100003);
  if (type === "decimal") return decimalWrong(question.answer.value);
  if (type === "money") return Number(question.answer.value) + 1;
  return "__wrong__";
}

function decimalWrong(value) {
  return String(Number(value) + 100003.125);
}

for (const [code, folder, manifestFile] of packs) {
  const manifest = readJson(path.join(root, folder, manifestFile));
  for (const entry of manifest.skills) {
    if (code === "PA" && Number(entry.id.slice(-2)) <= 7) continue;
    const spec = readJson(path.join(root, folder, entry.file));
    for (const question of spec.question_bank) {
      assert.equal(validators.validate(question, question.answer.value), true, `${question.id} accepts its authored answer`);
      assert.equal(validators.validate(question, definitelyWrong(question)), false, `${question.id} rejects an unrelated answer`);
    }
  }
}

const topicContext = { window: {} };
topicContext.window.window = topicContext.window;
vm.createContext(topicContext);
vm.runInContext(fs.readFileSync(path.join(root, "fractions", "js", "topics.js"), "utf8"), topicContext);
const topics = topicContext.window.RevilyTopics.all;
assert.equal(topics.length, 7, "seven topic collections registered");
assert.equal(topics.reduce((sum, topic) => sum + topic.expectedSkillCount, 0), 125, "all 125 current Revily lessons registered");
for (const route of ["add-subtract-fractions", "multiply-divide-fractions", "fractions-decimals-percentages", "percentage-amounts", "percentage-change"]) {
  assert.ok(topicContext.window.RevilyTopics.find(route), `${route} is routable`);
}

console.log("Structural pack, indexed-source coverage, answer validation and mirror checks passed for 71 bulk-origin lessons. This does not certify source fidelity or pedagogy; see the refinement audit.");
